"""
PostgreSQL history store (asyncpg) for user ↔ assistant turns.
"""

from __future__ import annotations
import datetime
import asyncpg
from typing import List, Dict, Any

from .config import (
    PG_HOST, PG_PORT, PG_DB, PG_USER, PG_PASSWORD,
    MAX_DB_ROWS, tokens, MAX_HISTORY_TOKENS,
)
from autogen_core.memory import ListMemory, MemoryContent, MemoryMimeType

__all__ = ["HistoryStore"]

class HistoryStore:
    """Thin async wrapper around a connection pool."""
    def __init__(self) -> None:
        self.pool: asyncpg.Pool | None = None

    # --------------------------------------------------------------------- #
    # life-cycle
    # --------------------------------------------------------------------- #
    async def connect(self) -> None:
        self.pool = await asyncpg.create_pool(
            host     = PG_HOST,
            port     = PG_PORT,
            user     = PG_USER,
            password = PG_PASSWORD,
            database = PG_DB,
        )

    async def close(self) -> None:
        if self.pool:
            await self.pool.close()

    # --------------------------------------------------------------------- #
    # CRUD helpers
    # --------------------------------------------------------------------- #
    async def save_turn(self, session_id: str, user_id: str,
                        prompt: str, response: str) -> None:
        assert self.pool, "Pool not initialised"
        await self.pool.execute(
            "INSERT INTO conversation_history VALUES($1,$2,$3,$4,$5)",
            session_id, user_id, datetime.datetime.now(datetime.timezone.utc), prompt, response
        )

    async def fetch_memory(
        self, session_id: str, token_budget: int = MAX_HISTORY_TOKENS
    ) -> ListMemory:
        """Return `ListMemory` containing the most recent turns."""
        assert self.pool, "Pool not initialised"
        rows = await self.pool.fetch(
            f"""
            SELECT prompt, response
              FROM conversation_history
             WHERE session_id=$1
             ORDER BY created_at DESC
             LIMIT {MAX_DB_ROWS}
            """,
            session_id,
        )
        # rows are newest → oldest; trim by token count
        used: int = 0
        kept: list[dict[str, Any]] = []
        for row in rows:
            for text in (row["response"], row["prompt"]):
                t = tokens(text)
                if used + t > token_budget:
                    kept.reverse()
                    return self._rows_to_memory(kept)
            kept.append(row)
            used += tokens(row["response"]) + tokens(row["prompt"])
        kept.reverse()
        return self._rows_to_memory(kept)

    # --------------------------------------------------------------------- #
    # internal
    # --------------------------------------------------------------------- #
    @staticmethod
    def _rows_to_memory(rows) -> ListMemory:
        """Convert list of DB rows (oldest→newest) to ListMemory."""
        mem = ListMemory()
        for r in rows:
            mem._contents.append(MemoryContent(
                content=r["prompt"],
                mime_type=MemoryMimeType.TEXT,
                metadata={"role": "user"},
            ))
            mem._contents.append(MemoryContent(
                content=r["response"],
                mime_type=MemoryMimeType.TEXT,
                metadata={"role": "assistant"},
            ))
        return mem
