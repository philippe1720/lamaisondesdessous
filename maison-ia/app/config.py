from functools import lru_cache
from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    env: str = "development"
    admin_token: str = Field(min_length=32)
    webhook_secret: str = Field(min_length=32)
    database_url: str = "sqlite:///./maison-ia.db"
    llm_provider: str = "openai"
    llm_model: str = ""
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    max_jobs_per_day: int = Field(10, ge=1, le=100)
    worker_enabled: bool = True
    github_token: str = ""
    github_seo_enabled: bool = False
    stripe_restricted_key: str = ""
    google_service_account_json_b64: str = ""
    ga4_property_id: str = ""
    search_console_site_url: str = "https://lamaisondesdessous.fr/"
    resend_api_key: str = ""
    smtp_host: str = ""
    smtp_port: int = 465
    smtp_user: str = ""
    smtp_password: str = ""
    imap_host: str = ""
    imap_port: int = 993
    mail_from: str = ""
    owner_email: str = ""
    notify_owner: bool = False
    instagram_business_id: str = ""
    instagram_access_token: str = ""
    graph_api_version: str = "v21.0"
    instagram_publish_enabled: bool = False
    daily_briefing_enabled: bool = False
    daily_briefing_hour: int = Field(8, ge=0, le=23)

    @model_validator(mode="after")
    def production_storage(self):
        if self.env == "production" and not self.database_url.startswith(("postgresql://", "postgresql+psycopg://")):
            raise ValueError("En production, DATABASE_URL doit utiliser PostgreSQL pour conserver les données.")
        if self.llm_provider not in ("openai", "anthropic"):
            raise ValueError("LLM_PROVIDER doit être openai ou anthropic")
        return self

@lru_cache
def get_settings():
    return Settings()
