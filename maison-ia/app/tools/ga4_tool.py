from typing import Literal

from .base import BaseTool
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import DateRange, Dimension, Metric, RunReportRequest
from pydantic import BaseModel, Field

from ..config import get_settings
from .google_auth import google_credentials


class GA4Input(BaseModel):
    days: int = Field(28, ge=1, le=365)
    dimension: Literal["sessionDefaultChannelGroup", "landingPage", "country", "deviceCategory"] = \
        "sessionDefaultChannelGroup"


class GA4ReportTool(BaseTool):
    name: str = "ga4_report"
    description: str = (
        "Rapport Google Analytics 4 : sessions, utilisateurs, ajouts panier, passages en caisse, "
        "achats et chiffre d'affaires, ventilés par canal / page d'entrée / pays / appareil."
    )
    args_schema: type[BaseModel] = GA4Input

    def _run(self, days: int = 28, dimension: str = "sessionDefaultChannelGroup") -> str:
        s = get_settings()
        if not s.ga4_property_id:
            return "GA4 non configuré (GA4_PROPERTY_ID manquant — ID numérique de propriété, pas G-XXXX)."
        try:
            client = BetaAnalyticsDataClient(credentials=google_credentials(
                ["https://www.googleapis.com/auth/analytics.readonly"]))
            req = RunReportRequest(
                property=f"properties/{s.ga4_property_id}",
                dimensions=[Dimension(name=dimension)],
                metrics=[Metric(name=m) for m in
                         ("sessions", "totalUsers", "addToCarts", "checkouts", "ecommercePurchases", "purchaseRevenue")],
                date_ranges=[DateRange(start_date=f"{days}daysAgo", end_date="today")],
                limit=25,
            )
            resp = client.run_report(req, timeout=25, retry=None)
        except Exception as e:
            return f"Erreur GA4 ({type(e).__name__})."
        rows = [f"{dimension} | sessions | users | paniers | caisse | achats | CA"]
        for r in resp.rows:
            rows.append(" | ".join([r.dimension_values[0].value] + [v.value for v in r.metric_values]))
        return "\n".join(rows)
