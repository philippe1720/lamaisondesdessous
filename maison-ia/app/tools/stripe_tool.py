"""EXEMPLE DE CUSTOM TOOL — connexion sécurisée à une API externe (Stripe).
Points clés : clé RESTREINTE lecture seule lue depuis l'environnement, entrées validées par
Pydantic (bornes), plafond de volume, aucune exception brute renvoyée au LLM, secret jamais loggé."""
import time
from collections import defaultdict

import stripe
from .base import BaseTool
from pydantic import BaseModel, Field

from ..config import get_settings

MAX_RECORDS = 2000


class StripeRevenueInput(BaseModel):
    days: int = Field(7, ge=1, le=90, description="Nombre de jours à analyser (1-90)")


class StripeRevenueTool(BaseTool):
    name: str = "stripe_revenue_summary"
    description: str = (
        "Résume les encaissements Stripe sur N jours, par devise : brut, frais Stripe, net, "
        "remboursements, nombre de transactions. Lecture seule."
    )
    args_schema: type[BaseModel] = StripeRevenueInput

    def _run(self, days: int = 7) -> str:
        key = get_settings().stripe_restricted_key
        if not key or not key.startswith("rk_live_"):
            return "Stripe : clé restreinte de production rk_live_ requise."
        since = int(time.time()) - days * 86400
        agg = defaultdict(lambda: {"brut": 0, "frais": 0, "net": 0, "remboursements": 0, "transactions": 0})
        try:
            n = 0
            for bt in stripe.BalanceTransaction.list(created={"gte": since}, limit=100,
                                                     api_key=key).auto_paging_iter():
                n += 1
                if n > MAX_RECORDS:
                    break
                cur = bt.currency
                if bt.type in ("charge", "payment"):
                    a = agg[cur]
                    a["brut"] += bt.amount
                    a["frais"] += bt.fee
                    a["net"] += bt.net
                    a["transactions"] += 1
                elif bt.type in ("refund", "payment_refund"):
                    agg[cur]["remboursements"] += -bt.amount
        except stripe.StripeError as e:  # ne jamais renvoyer l'objet d'erreur brut au LLM
            return f"Erreur Stripe ({type(e).__name__}) : lecture indisponible"
        if not agg:
            return f"Aucune transaction sur les {days} derniers jours."
        import json
        return json.dumps({"periode_jours": days, "source": "Stripe Balance Transactions",
            "scope": "Compte Stripe entier, pas uniquement la boutique", "tronque": n > MAX_RECORDS,
            "unite": "Toutes les sommes sont en unités mineures Stripe, ventilées par devise. Ne pas additionner les devises.",
            "note": "Net Stripe avant remboursements ≠ bénéfice. Remboursements présentés séparément ; leurs frais éventuels ne sont pas agrégés.",
            "devises": dict(agg)}, ensure_ascii=False)
