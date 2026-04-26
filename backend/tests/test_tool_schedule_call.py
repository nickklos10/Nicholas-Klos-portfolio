from app.tools.schedule_call import ScheduleCallTool


async def test_schedule_call_returns_calendly_url():
    tool = ScheduleCallTool()
    out = await tool.run({})
    assert out["url"].startswith("https://calendly.com/")
    assert out["label"] == "Pick a time"
