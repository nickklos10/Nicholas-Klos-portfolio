from pydantic import EmailStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    anthropic_api_key: str
    openai_api_key: str
    resend_api_key: str
    database_url: str
    owner_email: EmailStr
    frontend_origin: str

    calendly_url: str = "https://calendly.com/nicholask39/30min"
    claude_model: str = "claude-haiku-4-5-20251001"
    rate_limit_per_min: int = 30

    @field_validator("database_url")
    @classmethod
    def _coerce_asyncpg(cls, v: str) -> str:
        # Render's `connectionString` emits `postgres://` or `postgresql://` with
        # no driver. SQLAlchemy then defaults to psycopg2, which we don't ship.
        # Force the asyncpg driver across all input shapes.
        if v.startswith("postgres://"):
            return "postgresql+asyncpg://" + v[len("postgres://") :]
        if v.startswith("postgresql://") and "+asyncpg" not in v:
            return "postgresql+asyncpg://" + v[len("postgresql://") :]
        return v


settings = Settings()  # imported at app startup; raises on missing required keys
