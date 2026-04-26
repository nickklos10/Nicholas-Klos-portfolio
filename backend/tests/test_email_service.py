from unittest.mock import MagicMock

from app.services import email as email_module


async def test_send_followup_email_calls_resend(monkeypatch):
    fake_send = MagicMock(return_value={"id": "msg_123"})
    monkeypatch.setattr("app.services.email.resend.Emails.send", fake_send)

    msg_id = await email_module.send_followup_email(
        to="owner@example.com",
        name="Visitor",
        contact="visitor@example.com",
        question="Who are you?",
        summary="Asked about your background.",
    )

    assert msg_id == "msg_123"
    fake_send.assert_called_once()
    payload = fake_send.call_args.args[0]
    assert payload["to"] == ["owner@example.com"]
    assert "Visitor" in payload["subject"]
