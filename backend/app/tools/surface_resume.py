"""Render hint: tells the UI to show a resume download panel."""
from typing import Any

from pydantic import BaseModel


class SurfaceResumeInput(BaseModel):
    pass


class SurfaceResumeTool:
    name = "surface_resume"
    description = (
        "Surface Nicholas's resume as a downloadable PDF. Call this when the "
        "visitor asks to see his CV/resume, asks for a copy, or asks how to "
        "share his background with someone. The UI renders a download button — "
        "don't preface with 'sure, here it is', just keep your reply short."
    )
    input_schema = SurfaceResumeInput.model_json_schema()

    async def run(self, raw_input: dict[str, Any]) -> dict[str, Any]:
        return {
            "ok": True,
            "url": "/Nicholas-Klos-Resume.pdf",
            "filename": "Nicholas-Klos-Resume.pdf",
        }
