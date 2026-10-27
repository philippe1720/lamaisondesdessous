"""Email : envoi UNIQUEMENT vers le propriétaire (OWNER_EMAIL). Les emails clients passent par
une proposition approuvée. Le contenu de la boîte de réception est traité comme NON FIABLE."""
import email
import imaplib
import smtplib
from email.header import decode_header, make_header
from email.message import EmailMessage

from .base import BaseTool
from pydantic import BaseModel, Field

from ..config import get_settings


def send_to_owner(subject: str, body: str) -> None:
    s = get_settings()
    if s.resend_api_key and s.owner_email and s.mail_from:
        import httpx
        r = httpx.post("https://api.resend.com/emails", timeout=20,
            headers={"Authorization": "Bearer " + s.resend_api_key},
            json={"from": s.mail_from, "to": [s.owner_email], "subject": subject[:150], "text": body})
        if r.status_code >= 400:
            raise RuntimeError("Envoi du rapport indisponible")
        return
    if not (s.smtp_host and s.owner_email):
        raise RuntimeError("SMTP/OWNER_EMAIL non configurés")
    msg = EmailMessage()
    msg["From"], msg["To"], msg["Subject"] = s.mail_from or s.smtp_user, s.owner_email, subject[:150]
    msg.set_content(body)
    with smtplib.SMTP_SSL(s.smtp_host, s.smtp_port, timeout=20) as smtp:
        smtp.login(s.smtp_user, s.smtp_password)
        smtp.send_message(msg)


class InboxInput(BaseModel):
    limit: int = Field(10, ge=1, le=30)


class ReadInboxTool(BaseTool):
    name: str = "read_inbox_headers"
    description: str = "Expéditeur et objet des derniers emails non lus (en-têtes seulement)."
    args_schema: type[BaseModel] = InboxInput

    def _run(self, limit: int = 10) -> str:
        s = get_settings()
        if not s.imap_host:
            return "IMAP non configuré."
        try:
            with imaplib.IMAP4_SSL(s.imap_host, s.imap_port, timeout=20) as imap:
                imap.login(s.smtp_user, s.smtp_password)
                imap.select("INBOX", readonly=True)
                _, data = imap.search(None, "UNSEEN")
                ids = data[0].split()[-limit:]
                out = []
                for i in ids:
                    _, msg_data = imap.fetch(i, "(BODY.PEEK[HEADER.FIELDS (FROM SUBJECT)])")
                    m = email.message_from_bytes(msg_data[0][1])
                    out.append(f"{make_header(decode_header(m.get('From','')))} — {make_header(decode_header(m.get('Subject','')))}")
        except Exception as e:
            return f"Erreur IMAP ({type(e).__name__})."
        return "\n".join(out) or "Aucun email non lu."
