"""Bounded provider calls. No retries that silently multiply token consumption."""
import httpx
from .config import get_settings

class LLMUnavailable(RuntimeError):
    pass

def ready():
    s = get_settings()
    return bool(s.llm_model and (s.openai_api_key if s.llm_provider == "openai" else s.anthropic_api_key))

def complete(system: str, user: str, max_tokens=1400) -> str:
    s = get_settings()
    if not ready():
        raise LLMUnavailable("Configurer LLM_MODEL et la clé du fournisseur IA dans Render.")
    # Evidence budget per call limits context size and cost. External data remains untrusted.
    user = user[:30000]
    try:
        if s.llm_provider == "anthropic":
            r = httpx.post("https://api.anthropic.com/v1/messages", timeout=90,
                headers={"x-api-key": s.anthropic_api_key, "anthropic-version": "2023-06-01"},
                json={"model": s.llm_model, "max_tokens": max_tokens, "system": system,
                      "messages": [{"role": "user", "content": user}]})
            r.raise_for_status()
            return "\n".join(b.get("text", "") for b in r.json()["content"] if b.get("type") == "text")
        r = httpx.post("https://api.openai.com/v1/chat/completions", timeout=90,
            headers={"Authorization": f"Bearer {s.openai_api_key}"},
            json={"model": s.llm_model, "max_completion_tokens": max_tokens,
                  "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}]})
        r.raise_for_status()
        answer = r.json()["choices"][0]["message"]["content"]
        if not answer:
            raise LLMUnavailable("Réponse IA vide : vérifier le modèle et son budget de sortie.")
        return answer
    except httpx.HTTPStatusError as e:
        raise LLMUnavailable(f"Fournisseur IA : HTTP {e.response.status_code}. Vérifier modèle, clé et crédit API.") from None
    except (httpx.HTTPError, KeyError, ValueError):
        raise LLMUnavailable("Fournisseur IA indisponible ou réponse invalide.") from None
