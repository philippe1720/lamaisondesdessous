"""Persistent bounded queue. Running jobs interrupted by a crash need human retry."""
import threading
import time
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
from sqlalchemy import select, update, func
from .db import engine, jobs, locks
from .config import get_settings
from .llm import ready

class QueueFull(ValueError):
    pass

def enqueue(event):
    now = time.time()
    midnight = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0).timestamp()
    with engine().begin() as c:
        # An UPDATE takes a DB lock on SQLite and PostgreSQL, preventing cap races.
        c.execute(update(locks).where(locks.c.id == "admission").values(value=locks.c.value + 1))
        existing = c.execute(select(jobs.c.id).where(jobs.c.id == event["id"])).first()
        if existing:
            return False
        today = c.execute(select(func.count()).select_from(jobs).where(jobs.c.created_at >= midnight)).scalar_one()
        pending = c.execute(select(func.count()).select_from(jobs).where(jobs.c.status.in_(["queued", "running"]))).scalar_one()
        if today >= get_settings().max_jobs_per_day or pending >= 10:
            raise QueueFull("Limite de missions atteinte. Réessayer plus tard ou ajuster MAX_JOBS_PER_DAY.")
        c.execute(jobs.insert().values(**event, status="queued", created_at=now, updated_at=now,
                                      attempts=0, report="", error="", mail_status="disabled"))
    return True

def list_jobs():
    with engine().connect() as c:
        return [dict(r) for r in c.execute(select(jobs).order_by(jobs.c.created_at.desc()).limit(50)).mappings()]

def history_for(job):
    if job["type"] != "user.request":
        return []
    thread = job["data"].get("thread_id")
    # Bounded history, only same admin conversation. External events aren't conversation turns.
    with engine().connect() as c:
        rows = c.execute(select(jobs).where(jobs.c.type == "user.request", jobs.c.status == "completed")
                         .order_by(jobs.c.created_at.desc()).limit(50)).mappings()
        matching = [r for r in rows if r["data"].get("thread_id") == thread][:6]
    return [{"message": r["data"].get("message", ""), "report": r["report"][:3500]} for r in reversed(matching)]

def claim():
    with engine().begin() as c:
        row = c.execute(select(jobs).where(jobs.c.status == "queued").order_by(jobs.c.created_at).limit(1)).mappings().first()
        if not row:
            return None
        n = c.execute(update(jobs).where(jobs.c.id == row["id"], jobs.c.status == "queued")
            .values(status="running", updated_at=time.time(), attempts=jobs.c.attempts + 1)).rowcount
        return dict(row) if n else None

def run_one():
    if not ready():
        return False
    job = claim()
    if not job:
        return False
    from .orchestrator import handle_event
    try:
        report = handle_event({"id": job["id"], "type": job["type"], "data": job["data"]}, history_for(job))
        with engine().begin() as c:
            c.execute(update(jobs).where(jobs.c.id == job["id"]).values(status="completed", report=report,
                        updated_at=time.time(), mail_status="pending" if get_settings().notify_owner else "disabled"))
    except Exception as e:
        from .llm import LLMUnavailable
        error = str(e) if isinstance(e, LLMUnavailable) else f"Mission interrompue ({type(e).__name__}). Vérifier les connexions avant de relancer."
        with engine().begin() as c:
            c.execute(update(jobs).where(jobs.c.id == job["id"]).values(status="failed", error=error[:200], updated_at=time.time()))
    return True

def recover_stale():
    # Max job duration: 7 LLM calls x90s plus bounded connector reads; 30min allows headroom.
    with engine().begin() as c:
        c.execute(update(jobs).where(jobs.c.status == "running", jobs.c.updated_at < time.time() - 1800)
            .values(status="interrupted", error="Exécution interrompue. Vérifier les propositions déjà créées avant de relancer."))

def deliver_one():
    if not get_settings().notify_owner:
        return
    with engine().begin() as c:
        row = c.execute(select(jobs).where(jobs.c.mail_status == "pending").limit(1)).mappings().first()
        if not row:
            return
        n = c.execute(update(jobs).where(jobs.c.id == row["id"], jobs.c.mail_status == "pending").values(mail_status="sending")).rowcount
        if not n:
            return
    try:
        from .tools.email_tool import send_to_owner
        send_to_owner("[Maison IA] Rapport disponible", row["report"])
        status = "sent"
    except Exception:
        status = "needs_review"  # SMTP delivery may have succeeded before the connection failed.
    with engine().begin() as c:
        c.execute(update(jobs).where(jobs.c.id == row["id"]).values(mail_status=status))

def schedule():
    s = get_settings()
    now = datetime.now(ZoneInfo("Europe/Paris"))
    if s.daily_briefing_enabled and now.hour >= s.daily_briefing_hour and ready():
        try:
            enqueue({"id": "daily-" + now.date().isoformat(), "type": "daily.briefing", "data": {}})
        except QueueFull:
            pass  # Quota exhaustion must not block jobs already queued.

def loop(stop):
    while not stop.is_set():
        try:
            recover_stale()
            schedule()
            run_one()
            deliver_one()
        except Exception:
            # Never log provider errors, credentials, email bodies or connection strings.
            import logging
            logging.getLogger("maison-ia").warning("Cycle indisponible ; prochaine tentative dans 3 secondes")
        stop.wait(3)
