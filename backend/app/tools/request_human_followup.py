"""Tool: store a human-callback request and email the owner."""
from datetime import UTC, datetime
from typing import Any

from pydantic import BaseModel, Field

from app.config import settings
from app.db import SessionLocal
from app.models import FollowUp
from app.services.email import send_followup_email


class RequestHumanFollowupInput(BaseModel):
    name: str = Field(..., min_length=1, max_length=128)
    contact: str = Field(..., min_length=3, max_length=256, description="Email or phone")
    question: str = Field(..., min_length=10, max_length=4000)
    summary: str = Field(..., min_length=10, max_length=2000)


class RequestHumanFollowupTool:
    name = "request_human_followup"
    description = (
        "Pass a question to the real Nicholas when the visitor asks something only "
        "he can answer (private opinion, specific personal detail, hiring conversation "
        "that needs a human). Always confirm the visitor's name and contact first."
    )
    input_schema = RequestHumanFollowupInput.model_json_schema()

    async def run(self, raw_input: dict[str, Any]) -> dict[str, Any]:
        parsed = RequestHumanFollowupInput.model_validate(raw_input)

        async with SessionLocal() as session:
            row = FollowUp(
                name=parsed.name,
                contact=parsed.contact,
                question=parsed.question,
                summary=parsed.summary,
                ctx="general",
            )
            session.add(row)
            await session.flush()

            try:
                await send_followup_email(
                    to=str(settings.owner_email),
                    name=parsed.name,
                    contact=parsed.contact,
                    question=parsed.question,
                    summary=parsed.summary,
                )
                row.emailed_at = datetime.now(UTC)
            except Exception:
                # Email failure is recorded silently; the row still persists.
                pass

            await session.commit()
            return {"ok": True, "id": row.id}
