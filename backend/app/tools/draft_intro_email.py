"""Bot drafts an intro email; UI renders Copy + Open in Mail."""
from typing import Any
from urllib.parse import quote

from pydantic import BaseModel, Field

from app.config import settings


class DraftIntroEmailInput(BaseModel):
    subject: str = Field(..., min_length=3, max_length=200)
    body: str = Field(..., min_length=20, max_length=3000)


class DraftIntroEmailTool:
    name = "draft_intro_email"
    description = (
        "Draft an intro email tailored to what the visitor has told you. "
        "Use this only after the visitor signals real intent (asking about hiring, "
        "an open role, working together). Subject should be specific. Body should "
        "be in Nicholas's voice: plain, specific, no jargon, no exclamation marks."
    )
    input_schema = DraftIntroEmailInput.model_json_schema()

    async def run(self, raw_input: dict[str, Any]) -> dict[str, Any]:
        parsed = DraftIntroEmailInput.model_validate(raw_input)
        mailto = (
            f"mailto:{settings.owner_email}"
            f"?subject={quote(parsed.subject)}&body={quote(parsed.body)}"
        )
        return {
            "subject": parsed.subject,
            "body": parsed.body,
            "to": str(settings.owner_email),
            "mailto": mailto,
        }
