"""The actual storefront exposes /api/catalog, not a SQL products table."""
import json
import httpx
from pydantic import BaseModel, Field
from .base import BaseTool

class LowStockInput(BaseModel):
    threshold: int = Field(5, ge=0, le=1000)

class LowStockTool(BaseTool):
    name: str = "low_stock"
    description: str = "Catalogue réel de la boutique, variantes et stocks déclarés."
    args_schema: type[BaseModel] = LowStockInput
    def _run(self, threshold=5):
        try:
            r = httpx.get("https://lamaisondesdessous.fr/api/catalog", timeout=25, follow_redirects=False)
            r.raise_for_status()
            data = r.json()
            rows = [{"id": p["id"], "nom": p["name"], "variantes": p.get("variants", [])}
                    for p in data.get("products", [])[:60]]
            return json.dumps({"source": "https://lamaisondesdessous.fr/api/catalog",
                "updatedAt": data.get("updatedAt"), "live": data.get("live", False),
                "note": "Stock déclaré par le site ; si live=false, ce n'est pas une confirmation fournisseur en temps réel.",
                "seuil_alerte": threshold, "produits": rows}, ensure_ascii=False)
        except Exception as e:
            return f"Catalogue indisponible ({type(e).__name__}). Aucun stock confirmé."

class OrdersInput(BaseModel):
    days: int = Field(7, ge=1, le=90)

class OrdersSummaryTool(BaseTool):
    name: str = "orders_summary"
    description: str = "Commandes Stripe Checkout payées en mode réel, filtrées sur metadata.store=lmd."
    args_schema: type[BaseModel] = OrdersInput
    def _run(self, days=7):
        import time
        import stripe
        from ..config import get_settings
        key = get_settings().stripe_restricted_key
        if not key or not key.startswith("rk_live_"):
            return "Stripe : clé restreinte de production rk_live_ requise. Commandes inconnues."
        totals = {}
        scanned = 0
        try:
            for s in stripe.checkout.Session.list(api_key=key, limit=100,
                    created={"gte": int(time.time()) - days * 86400}).auto_paging_iter():
                scanned += 1
                if scanned > 2000:
                    break
                if not s.get("livemode") or s.get("payment_status") != "paid" or s.get("metadata", {}).get("store") != "lmd":
                    continue
                cur = s.get("currency", "unknown")
                a = totals.setdefault(cur, {"commandes": 0, "montant_unites_mineures": 0})
                a["commandes"] += 1
                a["montant_unites_mineures"] += s.get("amount_total", 0)
            return json.dumps({"periode_jours": days, "devises": totals, "tronque": scanned > 2000,
                "note": "Encaissements bruts ; ni bénéfice ni marge nette. Coûts fournisseur, livraison, remboursements et cotisations à rapprocher."})
        except Exception as e:
            return f"Commandes Stripe indisponibles ({type(e).__name__})."
