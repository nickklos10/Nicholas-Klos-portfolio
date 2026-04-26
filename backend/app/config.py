from pydantic import EmailStr
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
    claude_model: str = "claude-sonnet-4-6"
    rate_limit_per_min: int = 30


settings = Settings()  # imported at app startup; raises on missing required keys
