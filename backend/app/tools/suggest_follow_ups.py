"""Render hint: tells the UI what follow-up suggestions to show as pills."""
from typing import Any

from pydantic import BaseModel, Field


class SuggestFollowUpsInput(BaseModel):
    questions: list[str] = Field(
        ...,
        min_length=2,
        max_length=4,
        description=(
            "2 to 4 short follow-up questions a visitor might naturally ask "
            "next, phrased as the visitor would speak them. Each <= 60 chars. "
            "Specific to the conversation so far — no generic 'tell me more'."
        ),
    )


class SuggestFollowUpsTool:
    name = "suggest_follow_ups"
    description = (
        "Always call this at the very end of every reply with 3 short, "
        "conversation-specific follow-up questions the visitor might ask "
        "next. The UI renders them as clickable pills. Don't repeat questions "
        "already answered. Phrase as the visitor would ask them."
    )
    input_schema = SuggestFollowUpsInput.model_json_schema()

    async def run(self, raw_input: dict[str, Any]) -> dict[str, Any]:
        parsed = SuggestFollowUpsInput.model_validate(raw_input)
        return {"ok": True, "questions": parsed.questions}
