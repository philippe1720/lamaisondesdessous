import time
import threading
import uuid
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, ValidationError
from sqlalchemy import select
from .config import get_settings
from .db import init_db, engine
from .security import require_admin, verify_webhook
from . import proposals, queue, llm
from .orchestrator import ShopEvent, ROUTES
from .agents import ROLES

@asynccontextmanager
async def lifespan(app):
    get_settings()
    init_db()
    stop = threading.Event()
    thread = None
    if get_settings().worker_enabled:
        thread = threading.Thread(target=queue.loop, args=(stop,), daemon=True)
        thread.start()
    yield
    stop.set()
    if thread:
        thread.join(timeout=2)

app = FastAPI(title="Maison IA", lifespan=lifespan, docs_url=None, redoc_url=None, openapi_url=None)
static = Path(__file__).parent / "static"
app.mount("/static", StaticFiles(directory=static), name="static")

@app.middleware("http")
async def protect(request, call_next):
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-store"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"
    return response

@app.get("/")
def index():
    return FileResponse(static / "index.html")

@app.get("/health")
def health():
    try:
        with engine().connect() as c:
            c.execute(select(1))
    except Exception:
        raise HTTPException(503, "Stockage indisponible")
    return {"status": "ok"}

@app.get("/api/status", dependencies=[Depends(require_admin)])
def status():
    s = get_settings()
    return {"llm_ready": llm.ready(), "model": s.llm_model, "max_jobs_per_day": s.max_jobs_per_day,
        "worker_enabled": s.worker_enabled, "persistent_production_storage": not s.database_url.startswith("sqlite"),
        "connections": {"Boutique": "API catalogue publique — vérifiée à chaque mission achats",
        "IA": "Configurée, à tester" if llm.ready() else "Clé API et/ou modèle manquant",
        "Stripe": "Configuré, à tester" if s.stripe_restricted_key else "Non connecté",
        "GA4": "Configuré, à tester" if s.google_service_account_json_b64 and s.ga4_property_id else "Non connecté",
        "Search Console": "Configuré, à tester" if s.google_service_account_json_b64 else "Non connecté",
        "Email rapports": "Activé, à tester" if s.notify_owner and (s.smtp_host or s.resend_api_key) and s.owner_email else "Désactivé",
        "Boîte achats": "Configurée, à tester" if s.imap_host and s.smtp_user else "Non connectée",
        "Instagram": "Configuré, à tester" if s.instagram_access_token and s.instagram_business_id else "Non connecté",
        "TikTok": "Scripts uniquement — publication manuelle",
        "SEO du site": "PR GitHub après validation" if s.github_seo_enabled and s.github_token else "Propositions — connexion GitHub requise pour créer une PR"},
        "daily_briefing": s.daily_briefing_enabled}

class AskBody(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    agent: str = "direction"
    thread_id: str = Field(default="default", max_length=100, pattern=r"^[a-zA-Z0-9_-]+$")

def submit(event):
    try:
        fresh = queue.enqueue(event)
        return {"status": "queued" if fresh else "duplicate", "event_id": event["id"]}
    except queue.QueueFull as e:
        raise HTTPException(429, str(e))

@app.post("/ask", status_code=202, dependencies=[Depends(require_admin)])
def ask(body: AskBody):
    if body.agent != "direction" and body.agent not in ROLES:
        raise HTTPException(422, "Agent inconnu")
    if not body.message.strip():
        raise HTTPException(422, "Message vide")
    if not llm.ready():
        raise HTTPException(503, "Configurer la clé IA et LLM_MODEL dans Render. Les connecteurs ChatGPT ne sont pas transférés automatiquement.")
    return submit({"id": str(uuid.uuid4()), "type": "user.request", "data": body.model_dump()})

@app.get("/jobs", dependencies=[Depends(require_admin)])
def jobs():
    return queue.list_jobs()

@app.post("/jobs/{job_id}/retry", status_code=202, dependencies=[Depends(require_admin)])
def retry(job_id: str):
    from .db import jobs as table
    with engine().connect() as c:
        row = c.execute(select(table).where(table.c.id == job_id)).mappings().first()
    if not row:
        raise HTTPException(404, "Mission introuvable")
    if row["status"] not in ("failed", "interrupted"):
        raise HTTPException(409, "Seule une mission échouée ou interrompue peut être relancée")
    if not llm.ready():
        raise HTTPException(503, "IA non configurée")
    return submit({"id": str(uuid.uuid4()), "type": row["type"], "data": row["data"]})

@app.post("/webhooks/shop", status_code=202)
async def webhook(request: Request, x_signature: str | None = Header(default=None),
                  x_timestamp: str | None = Header(default=None)):
    raw = b""
    async for chunk in request.stream():
        raw += chunk
        if len(raw) > 64000:
            raise HTTPException(413, "Corps trop volumineux")
    verify_webhook(raw, x_signature, x_timestamp)
    try:
        event = ShopEvent.model_validate_json(raw)
    except ValidationError:
        raise HTTPException(422, "Événement invalide")
    if event.type not in ROUTES or event.type == "user.request":
        raise HTTPException(422, "Type non accepté")
    # Privacy: webhook sender must transmit only IDs/amounts, not customer addresses or cards.
    return submit(event.model_dump())

@app.get("/proposals", dependencies=[Depends(require_admin)])
def pending():
    return proposals.list_all()

@app.post("/proposals/{pid}/{decision}", dependencies=[Depends(require_admin)])
def decide(pid: str, decision: str):
    if decision not in ("approve", "reject"):
        raise HTTPException(404)
    try:
        return proposals.decide(pid, decision == "approve")
    except LookupError as e:
        raise HTTPException(404, str(e))
    except ValueError as e:
        raise HTTPException(409, str(e))
