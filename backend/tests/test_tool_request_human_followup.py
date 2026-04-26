from unittest.mock import AsyncMock

import pytest
from sqlalchemy import select

from app.db import SessionLocal
from app.models import FollowUp
from app.tools.request_human_followup import RequestHumanFollowupTool


@pytest.mark.integration
async def test_followup_writes_db_and_sends_email(monkeypatch):
    sent = AsyncMock(return_value="msg_xyz")
    monkeypatch.setattr("app.tools.request_human_followup.send_followup_email", sent)

    tool = RequestHumanFollowupTool()
    out = await tool.run(
        {
            "name": "Test Visitor",
            "contact": "visitor@example.com",
            "question": "What is your favourite eval metric?",
            "summary": "Asked about preferred eval metrics.",
        }
    )
    assert out["ok"] is True
    assert out["id"] > 0

    sent.assert_awaited_once()

    async with SessionLocal() as s:
        stored = await s.scalar(select(FollowUp).where(FollowUp.id == out["id"]))
        assert stored is not None
        assert stored.name == "Test Visitor"
        assert stored.emailed_at is not None
