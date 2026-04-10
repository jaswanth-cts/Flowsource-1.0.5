"""
FastAPI surface with TWO endpoints:
  1) POST /chat            -> JSON only (no images)
  2) POST /chat-multipart  -> multipart/form-data with files[] images

This file assumes the rest of the package is present:
- db.HistoryStore (Cosmos-PostgreSQL history)
- agents.AgentTemplates (factory for Autogen agents)
- router.RouterService (streams responses; accepts image_parts)
- image_store.to_vision_parts (converts uploaded files to data URLs)
"""

from __future__ import annotations
import uuid
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from .db import HistoryStore
from .agents import AgentTemplates
from .router import RouterService
from .image_store import to_vision_parts  # do not modify this module

__all__ = ["build_app"]

class New(BaseModel):
    session_id: str


def build_app() -> FastAPI:
    db = HistoryStore()
    templates = AgentTemplates()
    svc = RouterService(templates, db)

    app = FastAPI(title="Multi-Agent Chat (DB memory + Vision)")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ---- lifecycle --------------------------------------------------------
    @app.on_event("startup")
    async def _startup() -> None:
        await db.connect()

    @app.on_event("shutdown")
    async def _shutdown() -> None:
        await db.close()

    # ---- util -------------------------------------------------------------
    @app.get("/new_session", response_model=New)
    def new_session() -> New:
        return New(session_id=uuid.uuid4().hex)

    # ----------------------------------------------------------------------
    # MULTIPART endpoint (TEXT + IMAGES)
    # ----------------------------------------------------------------------
    async def _process_uploaded_files(files: List[UploadFile]) -> Optional[List[Dict[str, Any]]]:
        """Process uploaded files and convert them to vision parts."""
        if not files:
            return None

        raw_bytes: List[bytes] = []
        mimes: List[str] = []

        for f in files:
            try:
                data = await f.read()
                if data:  # Only process non-empty files
                    raw_bytes.append(data)
                    mimes.append(f.content_type or "image/png")
            except Exception as e:
                raise HTTPException(400, detail=f"Failed to read file: {e}")

        return to_vision_parts(raw_bytes, mimes) if raw_bytes else None

    @app.post("/chat")
    async def chat_multipart(
        query: str = Form(..., description="User prompt / question"),
        session_id: Optional[str] = Form(None, alias="sessionId"),
        user_id: Optional[str] = Form(None),
        files: Optional[List[UploadFile]] = File(default=None,
                                   description="One or more image files (files[])")
    ) -> StreamingResponse:
        """
        Content-Type: multipart/form-data
        Fields:
          - query     (text, required)
          - session_id (text, optional, mapped to session_id)
          - user_id    (text, optional)
          - files[]   (binary, optional; 0..N image files)
        """
        q = (query or "").strip()
        if not q:
            raise HTTPException(400, detail="Missing form field 'query'")

        sid = session_id or uuid.uuid4().hex
        uid = user_id or "anon"
        image_parts = await _process_uploaded_files(files or [])

        async def generate_response():
            chunks: List[str] = []
            async for chunk in svc.stream(q=q, sid=sid, image_parts=image_parts):
                chunks.append(chunk)
                yield chunk
            await db.save_turn(sid, uid, q, "".join(chunks))

        return StreamingResponse(
            generate_response(),
            media_type="text/event-stream",
            headers={"X-Session-ID": sid},
        )

    return app
