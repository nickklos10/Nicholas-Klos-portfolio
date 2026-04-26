"""Resend wrapper. Lives behind a thin async function so tests can mock it."""
import resend

from app.config import settings

resend.api_key = settings.resend_api_key


async def send_followup_email(
    *,
    to: str,
    name: str,
    contact: str,
    question: str,
    summary: str,
) -> str:
    """Send a follow-up notification to the owner. Returns the Resend message id."""
    body_text = (
        f"Visitor: {name}\n"
        f"Contact: {contact}\n\n"
        f"Question:\n{question}\n\n"
        f"Bot's summary:\n{summary}\n"
    )
    body_html = (
        f"<p><strong>Visitor:</strong> {name}</p>"
        f"<p><strong>Contact:</strong> {contact}</p>"
        f"<p><strong>Question:</strong><br>{question}</p>"
        f"<p><strong>Bot's summary:</strong><br>{summary}</p>"
    )

    payload = {
        "from": "Conversational Portfolio <onboarding@resend.dev>",
        "to": [to],
        "subject": f"[portfolio] Follow-up from {name}",
        "text": body_text,
        "html": body_html,
    }
    if "@" in contact:
        payload["reply_to"] = [contact]

    response = resend.Emails.send(payload)
    return response["id"]
