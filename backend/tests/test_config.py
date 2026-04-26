from app.config import Settings


def test_settings_loads_from_env(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "sk-test")
    monkeypatch.setenv("OPENAI_API_KEY", "sk-proj-test")
    monkeypatch.setenv("RESEND_API_KEY", "re-test")
    monkeypatch.setenv("DATABASE_URL", "postgresql+asyncpg://u:p@h:5432/d")
    monkeypatch.setenv("OWNER_EMAIL", "owner@example.com")
    monkeypatch.setenv("FRONTEND_ORIGIN", "http://localhost:3000")

    s = Settings()
    assert s.anthropic_api_key == "sk-test"
    assert s.openai_api_key == "sk-proj-test"
    assert s.resend_api_key == "re-test"
    assert s.calendly_url == "https://calendly.com/nicholask39/30min"  # default
    assert s.claude_model == "claude-sonnet-4-6"  # default
    assert s.rate_limit_per_min == 30  # default
