"""Client HTTP sécurisé partagé par les outils : liste blanche d'hôtes, timeout, retries,
token envoyé en en-tête Authorization (jamais dans l'URL, donc jamais dans les logs)."""
import httpx
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

ALLOWED_HOSTS = {"graph.facebook.com", "api.stripe.com"}


class ExternalAPIError(RuntimeError):
    pass


def _check(url: str) -> None:
    host = httpx.URL(url).host
    if httpx.URL(url).scheme != "https" or host not in ALLOWED_HOSTS:
        raise ExternalAPIError(f"Hôte non autorisé : {host}")


def _handle(r: httpx.Response) -> dict:
    if r.status_code >= 400:
        raise ExternalAPIError(f"HTTP {r.status_code} ({r.request.url.host})")
    return r.json()


_retry = retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=8),
               retry=retry_if_exception_type(httpx.TransportError), reraise=True)


@_retry
def get_json(url: str, *, token: str, params: dict | None = None) -> dict:
    _check(url)
    r = httpx.get(url, params=params, headers={"Authorization": f"Bearer {token}"},
                  timeout=15.0, follow_redirects=False)
    return _handle(r)


def post_form(url: str, *, token: str, data: dict) -> dict:
    _check(url)
    r = httpx.post(url, data=data, headers={"Authorization": f"Bearer {token}"},
                   timeout=30.0, follow_redirects=False)
    return _handle(r)
