"""Base protocol every tool implements."""
from typing import Any, Protocol


class ToolDef(Protocol):
    name: str
    """Anthropic tool name."""

    description: str
    """One-line description Claude reads."""

    input_schema: dict[str, Any]
    """JSON schema (typically derived via Pydantic .model_json_schema())."""

    async def run(self, raw_input: dict[str, Any]) -> dict[str, Any]:
        """Execute the tool. Returns a JSON-serialisable result the UI can render."""
        ...
