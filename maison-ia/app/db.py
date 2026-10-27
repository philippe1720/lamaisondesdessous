"""Tables propres à Maison IA ; aucune hypothèse sur le schéma de la boutique."""
from functools import lru_cache
from sqlalchemy import create_engine, MetaData, Table, Column, String, Text, Integer, Float, JSON
from .config import get_settings

metadata = MetaData()
jobs = Table("maison_ai_jobs", metadata,
    Column("id", String(100), primary_key=True), Column("type", String(40), nullable=False),
    Column("data", JSON, nullable=False), Column("status", String(30), nullable=False),
    Column("created_at", Float, nullable=False), Column("updated_at", Float, nullable=False),
    Column("attempts", Integer, nullable=False, default=0), Column("report", Text, default=""),
    Column("error", String(200), default=""), Column("mail_status", String(30), default="disabled"))
proposals = Table("maison_ai_proposals", metadata,
    Column("id", String(36), primary_key=True), Column("job_id", String(100)),
    Column("kind", String(40), nullable=False), Column("payload", JSON, nullable=False),
    Column("rationale", Text), Column("status", String(30), nullable=False),
    Column("created_at", Float), Column("result", Text, default=""))
# Serializes enqueue admission across processes, including daily cost cap.
locks = Table("maison_ai_locks", metadata, Column("id", String(20), primary_key=True), Column("value", Integer))

@lru_cache
def engine():
    url = get_settings().database_url
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+psycopg://", 1)
    args = {"check_same_thread": False, "timeout": 20} if url.startswith("sqlite") else {"connect_timeout": 10}
    return create_engine(url, pool_pre_ping=True, connect_args=args)

def init_db():
    metadata.create_all(engine())
    from sqlalchemy import select
    from sqlalchemy.exc import IntegrityError
    try:
        with engine().begin() as c:
            if not c.execute(select(locks.c.id).where(locks.c.id == "admission")).first():
                c.execute(locks.insert().values(id="admission", value=0))
    except IntegrityError:
        pass
