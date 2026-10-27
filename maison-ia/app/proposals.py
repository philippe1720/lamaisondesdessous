"""Human decisions are durable; uncertain external effects never auto-retry."""
import time
import uuid
from sqlalchemy import select, update
from pydantic import BaseModel, Field
from .db import engine, proposals as table
from .config import get_settings

KINDS = {"seo_update", "instagram_post", "tiktok_script", "offer", "copy_change", "supplier_search"}
class ProposalInput(BaseModel):
    kind: str
    payload: dict
    rationale: str = Field(max_length=2000)

def validate(kind, payload):
    if kind not in KINDS:
        raise ValueError("Type de proposition non pris en charge")
    import json
    if len(json.dumps(payload)) > 12000:
        raise ValueError("Proposition trop longue")
    if kind == "seo_update":
        from .tools.seo import validate as validate_seo
        validate_seo(payload)
    if kind == "instagram_post":
        from urllib.parse import urlparse
        u = urlparse(str(payload.get("image_url", "")))
        if u.scheme != "https" or u.hostname != "lamaisondesdessous.fr" or u.username or u.password:
            raise ValueError("L'image doit être hébergée sur lamaisondesdessous.fr en HTTPS")
        if not 1 <= len(str(payload.get("caption", ""))) <= 2200:
            raise ValueError("Légende Instagram requise, 2200 caractères maximum")
    elif not payload:
        raise ValueError("Contenu requis")

def create(kind, payload, rationale, job_id):
    validate(kind, payload)
    pid = str(uuid.uuid4())
    with engine().begin() as c:
        c.execute(table.insert().values(id=pid, kind=kind, payload=payload,
            rationale=rationale[:2000], job_id=job_id, status="pending", created_at=time.time(), result=""))
    return pid

def list_all():
    with engine().connect() as c:
        return [dict(r) for r in c.execute(select(table).order_by(table.c.created_at.desc()).limit(100)).mappings()]

def decide(pid, approve):
    with engine().begin() as c:
        row = c.execute(select(table).where(table.c.id == pid)).mappings().first()
        if not row:
            raise LookupError("Proposition introuvable")
        if row["status"] != "pending":
            raise ValueError("Cette proposition a déjà été traitée")
        validate(row["kind"], row["payload"])
        if approve and row["kind"] == "instagram_post" and not get_settings().instagram_publish_enabled:
            raise ValueError("Publication désactivée. Configurer Instagram et INSTAGRAM_PUBLISH_ENABLED avant validation.")
        if approve and row["kind"] == "seo_update" and not (get_settings().github_seo_enabled and get_settings().github_token):
            raise ValueError("Configurer GITHUB_TOKEN et GITHUB_SEO_ENABLED pour créer une proposition GitHub.")
        status = "executing" if approve and row["kind"] in ("instagram_post", "seo_update") else ("approved_manual" if approve else "rejected")
        n = c.execute(update(table).where(table.c.id == pid, table.c.status == "pending").values(status=status)).rowcount
        if not n:
            raise ValueError("Décision déjà en cours")
    result = "Validée pour exécution manuelle ; aucune modification de la boutique ni publication effectuée." if approve else "Refusée."
    if status == "executing":
        try:
            if row["kind"] == "seo_update":
                from .tools.seo import create_pr
                result, status = "PR créée, à vérifier et fusionner : " + create_pr(row["payload"], pid), "executed"
            else:
                from .tools.instagram import publish_image
                media = publish_image(row["payload"]["image_url"], row["payload"]["caption"])
                result, status = f"Publié sur Instagram : {media}", "executed"
        except Exception:
            result, status = "Résultat incertain. Vérifier GitHub ou Instagram avant toute nouvelle action ; aucune relance automatique.", "needs_review"
    with engine().begin() as c:
        c.execute(update(table).where(table.c.id == pid).values(status=status, result=result))
    return {"status": status, "result": result}
