"""
Session-aware router:
* Builds ListMemory from DB
* Uses router agent to pick destination
* Streams specialised agent answer
"""

from __future__ import annotations
import json
from typing import AsyncGenerator, Dict, List, Any
from autogen_agentchat.messages import ModelClientStreamingChunkEvent, ToolCallSummaryMessage
from autogen_core import CancellationToken
from .config  import MAX_HISTORY_TOKENS
from .db      import HistoryStore
from .agents  import AgentTemplates
from .rag     import SearchHelper, pretty_ctx
from .memory  import ListMemory, MemoryContent, MemoryMimeType
from .vision  import VisionAnalyzer

__all__ = ["RouterService"]

class RouterService:
    def __init__(self, templates: AgentTemplates, db: HistoryStore) -> None:
        self.t = templates
        self.db = db
        # ---------- change starts here ---------------------------------- #
        # Tools will be fetched lazily on first use and cached.
        self._tool_cache: Dict[str, List[Any]] = {}
        # ---------- change ends here ------------------------------------ #
        self._vision = VisionAnalyzer()

    # ------------------------------------------------------------------ #
    async def _pick_agent(self, q: str, mem) -> str:
        router = self.t.router["make_agent"](mem)
        rsp = await router.run(task=q)
        try:
            return json.loads(rsp.messages[-1].content)["agent"]
        except Exception:
            txt = rsp.messages[-1].content.lower()
            return next((n for n in self.t.child if n.lower() in txt), "GeneralAssistant")

    # ------------------------------------------------------------------
    async def _ensure_tools(self, name: str) -> List[Any]:
        """Fetch MCP tools once and cache them."""
        if name in self._tool_cache:
            return self._tool_cache[name]
        if not self.t.child[name]["mcp"]:
            self._tool_cache[name] = []
            return []
        tools = await self.t.fetch_tools(name)          # real network call
        self._tool_cache[name] = tools
        return tools
    # ------------------------------------------------------------------ #
    async def stream(self, 
                     q: str, 
                     sid: str,
                     image_parts: List[Dict] | None = None,  # {"type":"image_url","image_url":{"url": "..."}}
                     ) -> AsyncGenerator[str, None]:
        
        # 4) optional RAG -> inject context into memory
        ctx_display: List[Dict[str, str]] = []
        # 2) Vision pre-processing (inject analysis in memory)
        if image_parts:
            vision_summary = await self._vision.summarize(q, image_parts)
            if vision_summary:

                yield json.dumps(ctx_display) 
                # 5) persist turn
                await self.db.save_turn(sid, "unknown", q, "### VISION CONTEXT\n" + vision_summary)

                yield vision_summary
                # await mem.add(MemoryContent(
                #     content="### VISION CONTEXT\n" + vision_summary,
                #     mime_type=MemoryMimeType.TEXT,
                #     metadata={"role":"system"},
                # ))
                return
        
        # 1) memory from DB
        mem = await self.db.fetch_memory(sid, MAX_HISTORY_TOKENS)

        # 3) choose specialised agent
        name = await self._pick_agent(q, mem)
        meta = self.t.child[name]
        tools = await self._ensure_tools(name)          # <- changed
        agent = meta["make_agent"](mem, tools)

        # 4) optional RAG -> inject context into memory
        ctx_display: List[Dict[str, str]] = []
        if meta["is_rag"]:
            helper = SearchHelper(meta["index"])
            trim = helper.trimmed_records(q)
            ctx_display = [{r["source"]: r["content"]} for r in trim]
            await mem.add(
                            MemoryContent(
                                content="### CONTEXT\n" + pretty_ctx(trim),
                                mime_type=MemoryMimeType.TEXT,
                                metadata={"role": "system"},
                            )
                        )
        yield json.dumps(ctx_display)
        # 4) run agent (history + context already in memory)
        reply_chunks: List[str] = []
        async for ev in agent.run_stream(task=q, cancellation_token=CancellationToken()):
            if isinstance(ev, ModelClientStreamingChunkEvent):
                reply_chunks.append(ev.content)
                yield ev.content
            elif isinstance(ev, ToolCallSummaryMessage):
                # pipe to ContentRefiner if configured
                refiner = self.t.child["ContentRefiner"]["make_agent"](mem, [])
                async for ev2 in refiner.run_stream(task=ev.content, cancellation_token=CancellationToken()):
                    if isinstance(ev2, ModelClientStreamingChunkEvent):
                        reply_chunks.append(ev2.content)
                        yield ev2.content

        # 5) persist turn
        await self.db.save_turn(sid, "unknown", q, "".join(reply_chunks))

        # 6) expose context JSON first (client can ignore if not needed)
        #yield json.dumps(ctx_display) + "\n\n"
