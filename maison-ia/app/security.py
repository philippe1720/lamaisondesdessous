"""Authentification : webhooks signés (HMAC-SHA256 + horodatage anti-rejeu) et jeton admin."""
import hashlib
import hmac
import time

from fastapi import Header, HTTPException

from .config import get_settings

TOLERANCE_SECONDS = 300


def sign(secret: str, timestamp: str, raw_body: bytes) -> str:
    return hmac.new(secret.encode(), timestamp.encode() + b"." + raw_body, hashlib.sha256).hexdigest()


def verify_webhook(raw_body: bytes, signature: str | None, timestamp: str | None) -> None:
    if not signature or not timestamp:
        raise HTTPException(401, "Signature manquante")
    try:
        ts = int(timestamp)
    except ValueError:
        raise HTTPException(401, "Horodatage invalide")
    if abs(time.time() - ts) > TOLERANCE_SECONDS:
        raise HTTPException(401, "Requête expirée")
    expected = sign(get_settings().webhook_secret, timestamp, raw_body)
    if not hmac.compare_digest(expected, signature):
        raise HTTPException(401, "Signature invalide")


def require_admin(authorization: str | None = Header(default=None)) -> None:
    expected = f"Bearer {get_settings().admin_token}"
    if not authorization or not hmac.compare_digest(authorization, expected):
        raise HTTPException(401, "Non autorisé")
