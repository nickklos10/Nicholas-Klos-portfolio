"""Returns the Calendly URL for the UI to render as a button."""
from typing import Any

from pydantic import BaseModel

from app.config import settings


class ScheduleCallInput(BaseModel):
    pass


class ScheduleCallTool:
    name = "schedule_call"
    description = (
        "Surface a 'Pick a time' button that opens Nicholas's Calendly. "
        "Use when the visitor explicitly asks to schedule, set up, or book a call."
    )
    input_schema = ScheduleCallInput.model_json_schema()

    async def run(self, raw_input: dict[str, Any]) -> dict[str, Any]:
        return {"url": settings.calendly_url, "label": "Pick a time"}
