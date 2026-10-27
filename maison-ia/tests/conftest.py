import os
import tempfile
from pathlib import Path
os.environ['ADMIN_TOKEN'] = 'test-admin-' + 'a' * 32
os.environ['WEBHOOK_SECRET'] = 'test-webhook-' + 'b' * 32
os.environ['DATABASE_URL'] = 'sqlite:///' + str(Path(tempfile.mkdtemp()) / 'tests.db')
os.environ['WORKER_ENABLED'] = 'false'
os.environ['ENV'] = 'test'
import pytest
from app.db import init_db, engine, jobs, proposals
from app.config import get_settings

@pytest.fixture(autouse=True)
def clean_db():
    init_db()
    with engine().begin() as c:
        c.execute(jobs.delete())
        c.execute(proposals.delete())
    s = get_settings()
    original = s.model_copy()
    yield
    for field in type(s).model_fields:
        setattr(s, field, getattr(original, field))
