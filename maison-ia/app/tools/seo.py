"""SEO changes are proposed as GitHub PRs against the real storefront branch."""
import base64
import json
import httpx
from pydantic import BaseModel
from .base import BaseTool
from ..config import get_settings

ROOT = "https://api.github.com/repos/philippe1720/lamaisondesdessous"
BRANCH = "feat/boutique-bas"
FILES = {"category": "artifacts/lingerie-shop/src/data/editorial.json",
         "product": "artifacts/lingerie-shop/src/data/catalog.json"}

def request(method, path, **kwargs):
    token = get_settings().github_token
    headers = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
    if token:
        headers["Authorization"] = "Bearer " + token
    r = httpx.request(method, ROOT + path, headers=headers, timeout=25, follow_redirects=False, **kwargs)
    if r.status_code >= 400:
        raise RuntimeError(f"GitHub HTTP {r.status_code}")
    return r.json()

def document(target, ref=BRANCH):
    raw = request("GET", "/contents/" + FILES[target], params={"ref": ref})
    return raw, json.loads(base64.b64decode(raw["content"]))

class Empty(BaseModel):
    pass

class SeoContentTool(BaseTool):
    name: str = "seo_content"
    description: str = "Titres et descriptions du code réellement déployé, pour propositions vérifiables."
    args_schema: type[BaseModel] = Empty
    def _run(self):
        try:
            _, editorial = document("category")
            _, catalogue = document("product")
            return json.dumps({"branch": BRANCH, "categories": [{k: r[k] for k in ("path", "title", "description")}
                for r in editorial["categories"]], "products": [{k: r[k] for k in ("id", "name", "description")}
                for r in catalogue["products"][:40]]}, ensure_ascii=False)
        except Exception as e:
            return f"Contenus GitHub indisponibles ({type(e).__name__})."

def validate(payload):
    target = payload.get("target")
    fields = {"category": {"title", "description"}, "product": {"name", "description"}}
    if target not in fields or payload.get("field") not in fields[target]:
        raise ValueError("SEO : target category/product et champ autorisé requis")
    if not isinstance(payload.get("key"), str) or not payload["key"]:
        raise ValueError("SEO : clé path de catégorie ou id produit requise")
    if not isinstance(payload.get("before"), str) or not isinstance(payload.get("after"), str):
        raise ValueError("SEO : textes before et after requis")
    if not 1 <= len(payload["after"]) <= 2000 or len(payload["before"]) > 12000:
        raise ValueError("SEO : longueur de texte invalide")

def create_pr(payload, proposal_id):
    validate(payload)
    ref = request("GET", "/git/ref/heads/" + BRANCH)
    sha = ref["object"]["sha"]
    raw, doc = document(payload["target"], sha)
    rows, key = (doc["categories"], "path") if payload["target"] == "category" else (doc["products"], "id")
    row = next((r for r in rows if str(r.get(key)) == payload["key"]), None)
    if row is None or row.get(payload["field"]) != payload["before"]:
        raise ValueError("Le contenu a changé depuis la proposition. Demander une nouvelle analyse.")
    row[payload["field"]] = payload["after"]
    branch = "maison-ai/seo-" + proposal_id
    # One attempt only. If network results are uncertain, review this deterministic branch manually.
    request("POST", "/git/refs", json={"ref": "refs/heads/" + branch, "sha": sha})
    content = base64.b64encode((json.dumps(doc, ensure_ascii=False, indent=2) + "\n").encode()).decode()
    request("PUT", "/contents/" + FILES[payload["target"]], json={"message": "SEO: proposition approuvée " + proposal_id,
            "content": content, "sha": raw["sha"], "branch": branch})
    pr = request("POST", "/pulls", json={"title": "SEO : " + payload["key"][:100], "head": branch, "base": BRANCH,
        "body": "Proposition approuvée dans Maison IA. Vérifier le diff et le build avant fusion. Aucun déploiement boutique déclenché par cette PR.", "draft": True})
    return pr["html_url"]
