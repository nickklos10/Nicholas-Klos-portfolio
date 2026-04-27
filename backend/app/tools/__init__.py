"""Tool registry. Tools are registered here and discovered by the chat handler."""
from app.tools.base import ToolDef

# Tools are wired up incrementally across Tasks 16, 17, 18, 20.
# Until all four are implemented, the registry is empty but the module imports.
TOOLS: dict[str, ToolDef] = {}

try:
    from app.tools.surface_projects import SurfaceProjectsTool
    TOOLS["surface_projects"] = SurfaceProjectsTool()
except ImportError:
    pass

try:
    from app.tools.draft_intro_email import DraftIntroEmailTool
    TOOLS["draft_intro_email"] = DraftIntroEmailTool()
except ImportError:
    pass

try:
    from app.tools.schedule_call import ScheduleCallTool
    TOOLS["schedule_call"] = ScheduleCallTool()
except ImportError:
    pass

try:
    from app.tools.request_human_followup import RequestHumanFollowupTool
    TOOLS["request_human_followup"] = RequestHumanFollowupTool()
except ImportError:
    pass

try:
    from app.tools.surface_resume import SurfaceResumeTool
    TOOLS["surface_resume"] = SurfaceResumeTool()
except ImportError:
    pass

try:
    from app.tools.suggest_follow_ups import SuggestFollowUpsTool
    TOOLS["suggest_follow_ups"] = SuggestFollowUpsTool()
except ImportError:
    pass


def anthropic_tool_specs() -> list[dict]:
    """Format expected by the Anthropic SDK's `tools=` argument."""
    return [
        {"name": t.name, "description": t.description, "input_schema": t.input_schema}
        for t in TOOLS.values()
    ]
