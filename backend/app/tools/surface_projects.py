"""Render hint: tells the UI to display these case-study cards."""
from typing import Any

from pydantic import BaseModel, Field


class SurfaceProjectsInput(BaseModel):
    ids: list[str] = Field(..., min_length=1, max_length=3, description="Case study ids")


class SurfaceProjectsTool:
    name = "surface_projects"
    description = (
        "Show the visitor case-study cards for specific projects. "
        "Use case-study slugs as ids: f1gpt, serie-a, concrete-crack, "
        "sql-warehouse, finsight-backend, fashion-cnn. Max 3 ids."
    )
    input_schema = SurfaceProjectsInput.model_json_schema()

    async def run(self, raw_input: dict[str, Any]) -> dict[str, Any]:
        parsed = SurfaceProjectsInput.model_validate(raw_input)
        return {"ok": True, "ids": parsed.ids}
