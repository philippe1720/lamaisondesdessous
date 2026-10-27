import os
import time

os.environ.setdefault("WEBHOOK_SECRET", "test-secret")
os.environ.setdefault("ADMIN_TOKEN", "test-admin")

import pytest
from fastapi import HTTPException

from app.config import get_settings
from app.security import sign, verify_webhook

SECRET = get_settings().webhook_secret


def test_valid_signature():
    body, ts = b'{"id":"1","type":"stock.low"}', str(int(time.time()))
    verify_webhook(body, sign(SECRET, ts, body), ts)


def test_bad_signature():
    ts = str(int(time.time()))
    with pytest.raises(HTTPException):
        verify_webhook(b"{}", "deadbeef", ts)


def test_expired_timestamp():
    body, ts = b"{}", str(int(time.time()) - 3600)
    with pytest.raises(HTTPException):
        verify_webhook(body, sign(SECRET, ts, body), ts)
