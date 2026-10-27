import base64
import json

from google.oauth2 import service_account

from ..config import get_settings


def google_credentials(scopes: list[str]):
    b64 = get_settings().google_service_account_json_b64
    if not b64:
        raise RuntimeError("GOOGLE_SERVICE_ACCOUNT_JSON_B64 non défini")
    info = json.loads(base64.b64decode(b64))
    return service_account.Credentials.from_service_account_info(info, scopes=scopes)
