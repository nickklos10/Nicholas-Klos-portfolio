"""Anthropic streaming tool-use loop. Yields typed events for SSE serialisation."""
from collections.abc import AsyncIterator
from dataclasses import dataclass
from typing import Any, Literal

from anthropic import AsyncAnthropic

from app.config import settings
from app.tools import TOOLS, anthropic_tool_specs

_client = AsyncAnthropic(api_key=settings.anthropic_api_key)

EventKind = Literal["text", "tool", "ctx", "done"]


@dataclass
class StreamEvent:
    kind: EventKind
    data: dict[str, Any]


async def stream_chat(
    *,
    system: str,
    messages: list[dict[str, Any]],
    max_tokens: int = 1024,
) -> AsyncIterator[StreamEvent]:
    """Run the Anthropic tool-use loop. Yields text deltas, tool events, then done."""
    convo: list[dict[str, Any]] = list(messages)
    tool_specs = anthropic_tool_specs()
    fired_tools: list[str] = []

    while True:
        async with _client.messages.stream(
            model=settings.claude_model,
            system=system,
            messages=convo,
            tools=tool_specs,
            max_tokens=max_tokens,
        ) as stream:
            async for event in stream:
                if event.type == "content_block_delta" and event.delta.type == "text_delta":
                    yield StreamEvent("text", {"delta": event.delta.text})

            final = await stream.get_final_message()

        tool_uses = [b for b in final.content if b.type == "tool_use"]
        convo.append({"role": "assistant", "content": [b.model_dump() for b in final.content]})

        if not tool_uses:
            break

        tool_results: list[dict[str, Any]] = []
        for tu in tool_uses:
            tool = TOOLS.get(tu.name)
            if not tool:
                tool_results.append(
                    {
                        "type": "tool_result",
                        "tool_use_id": tu.id,
                        "content": [{"type": "text", "text": f"Unknown tool: {tu.name}"}],
                        "is_error": True,
                    }
                )
                continue
            try:
                output = await tool.run(tu.input)
                fired_tools.append(tu.name)
                yield StreamEvent("tool", {"name": tu.name, "input": tu.input, "output": output})
                tool_results.append(
                    {
                        "type": "tool_result",
                        "tool_use_id": tu.id,
                        "content": [{"type": "text", "text": str(output)}],
                    }
                )
            except Exception as exc:
                tool_results.append(
                    {
                        "type": "tool_result",
                        "tool_use_id": tu.id,
                        "content": [{"type": "text", "text": f"Tool error: {exc}"}],
                        "is_error": True,
                    }
                )

        convo.append({"role": "user", "content": tool_results})

        if final.stop_reason != "tool_use":
            break

    ctx = _ctx_from_tools(fired_tools)
    yield StreamEvent("ctx", {"ctx": ctx})
    yield StreamEvent("done", {})


def _ctx_from_tools(fired: list[str]) -> str:
    if "surface_projects" in fired:
        return "work"
    if "draft_intro_email" in fired or "schedule_call" in fired:
        return "contact"
    if "request_human_followup" in fired:
        return "contact"
    return "general"
