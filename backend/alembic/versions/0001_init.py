"""init: create vector extension and core tables

Revision ID: 0001
Revises:
Create Date: 2026-04-26 00:00:00

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from pgvector.sqlalchemy import Vector

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    op.create_table(
        "documents",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("slug", sa.String(128), nullable=False, unique=True),
        sa.Column("title", sa.String(256), nullable=False),
        sa.Column("kind", sa.String(32), nullable=False),
        sa.Column("source_path", sa.String(512), nullable=False),
        sa.Column("body_md", sa.Text, nullable=False),
        sa.Column("content_hash", sa.String(64), nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index("ix_documents_kind", "documents", ["kind"])
    op.create_index("ix_documents_content_hash", "documents", ["content_hash"])

    op.create_table(
        "chunks",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column(
            "document_id",
            sa.Integer,
            sa.ForeignKey("documents.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("ord", sa.Integer, nullable=False),
        sa.Column("text", sa.Text, nullable=False),
        sa.Column("embedding", Vector(1024), nullable=False),
        sa.Column("tokens", sa.Integer, nullable=False),
    )
    op.create_index("ix_chunks_document_id", "chunks", ["document_id"])
    # IVFFlat index for cosine similarity once we have data:
    op.execute(
        "CREATE INDEX ix_chunks_embedding ON chunks "
        "USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)"
    )

    op.create_table(
        "followups",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String(128), nullable=False),
        sa.Column("contact", sa.String(256), nullable=False),
        sa.Column("question", sa.Text, nullable=False),
        sa.Column("summary", sa.Text, nullable=False),
        sa.Column("ctx", sa.String(32), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column("emailed_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("followups")
    op.execute("DROP INDEX IF EXISTS ix_chunks_embedding")
    op.drop_index("ix_chunks_document_id", table_name="chunks")
    op.drop_table("chunks")
    op.drop_index("ix_documents_content_hash", table_name="documents")
    op.drop_index("ix_documents_kind", table_name="documents")
    op.drop_table("documents")
    op.execute("DROP EXTENSION IF EXISTS vector")
