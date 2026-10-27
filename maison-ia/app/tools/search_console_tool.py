from typing import Literal

from .base import BaseTool
from googleapiclient.discovery import build
from pydantic import BaseModel, Field

from ..config import get_settings
from .google_auth import google_credentials


class GSCInput(BaseModel):
    days: int = Field(28, ge=1, le=90)
    dimension: Literal["query", "page"] = "query"
    row_limit: int = Field(25, ge=1, le=100)


class SearchConsoleTool(BaseTool):
    name: str = "search_console_report"
    description: str = "Performances de recherche Google (clics, impressions, CTR, position) par requête ou par page."
    args_schema: type[BaseModel] = GSCInput

    def _run(self, days: int = 28, dimension: str = "query", row_limit: int = 25) -> str:
        from datetime import date, timedelta
        import httplib2
        from google_auth_httplib2 import AuthorizedHttp
        s = get_settings()
        try:
            svc = build("searchconsole", "v1", cache_discovery=False, http=AuthorizedHttp(google_credentials(
                ["https://www.googleapis.com/auth/webmasters.readonly"]), http=httplib2.Http(timeout=25)))
            body = {
                "startDate": (date.today() - timedelta(days=days)).isoformat(),
                "endDate": date.today().isoformat(),
                "dimensions": [dimension],
                "rowLimit": row_limit,
            }
            resp = svc.searchanalytics().query(siteUrl=s.search_console_site_url, body=body).execute()
        except Exception as e:
            return f"Erreur Search Console ({type(e).__name__})."
        rows = [f"{dimension} | clics | impressions | ctr | position"]
        for r in resp.get("rows", []):
            rows.append(f"{r['keys'][0]} | {r['clicks']} | {r['impressions']} | {r['ctr']:.1%} | {r['position']:.1f}")
        return "\n".join(rows)
