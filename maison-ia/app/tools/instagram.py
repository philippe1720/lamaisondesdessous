from .base import BaseTool
from pydantic import BaseModel, Field

from ..config import get_settings
from .http import ExternalAPIError, get_json, post_form


class RecentPostsInput(BaseModel):
    limit: int = Field(10, ge=1, le=25)


class InstagramRecentPostsTool(BaseTool):
    name: str = "instagram_recent_posts"
    description: str = "Derniers posts Instagram avec likes, commentaires et date (analyse d'engagement)."
    args_schema: type[BaseModel] = RecentPostsInput

    def _run(self, limit: int = 10) -> str:
        s = get_settings()
        if not (s.instagram_access_token and s.instagram_business_id):
            return "Instagram non configuré."
        try:
            data = get_json(
                f"https://graph.facebook.com/{s.graph_api_version}/{s.instagram_business_id}/media",
                token=s.instagram_access_token,
                params={"fields": "caption,media_type,timestamp,like_count,comments_count,permalink", "limit": limit},
            )
        except (ExternalAPIError, Exception) as e:
            return f"Erreur Instagram ({type(e).__name__})."
        return "\n".join(
            f"{p.get('timestamp','')[:10]} | {p.get('media_type')} | ❤ {p.get('like_count',0)} | "
            f"💬 {p.get('comments_count',0)} | {(p.get('caption') or '')[:80]!r}"
            for p in data.get("data", [])
        ) or "Aucun post."


def publish_image(image_url: str, caption: str) -> str:
    """Appelée UNIQUEMENT après approbation humaine (proposals.approve)."""
    s = get_settings()
    base = f"https://graph.facebook.com/{s.graph_api_version}/{s.instagram_business_id}"
    container = post_form(f"{base}/media", token=s.instagram_access_token,
                          data={"image_url": image_url, "caption": caption})
    published = post_form(f"{base}/media_publish", token=s.instagram_access_token,
                          data={"creation_id": container["id"]})
    return published["id"]
