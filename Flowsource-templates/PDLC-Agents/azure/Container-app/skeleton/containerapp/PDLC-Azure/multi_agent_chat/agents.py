"""
Agent factory functions driven by *agents_config.json*.
"""

from __future__ import annotations
import json
from pathlib import Path
from typing import Dict, List, Any

from autogen_agentchat.agents import AssistantAgent
from autogen_ext.tools.mcp import mcp_server_tools, SseServerParams, StreamableHttpServerParams

from .llm import chat_client
from .memory import ListMemory

__all__ = ["AgentTemplates"]

class AgentTemplates:
    """
    Loads *agents_config.json* once and exposes callables
    to build router & child agents:  make_agent(memory, tools)
    """

    def __init__(self, cfg_path: str = "agents_config.json") -> None:
        spec = json.loads(Path(cfg_path).read_text())

        self.child: Dict[str, dict] = {}
        for a in spec["agents"]:
            def _factory(
                system=a["system_message"],
                llm_over=a.get("llm_config_overrides", {}),
            ):
                def _make(mem: ListMemory, tools: List[Any]):
                    return AssistantAgent(
                        name=a["name"],
                        system_message=system,
                        model_client=chat_client(llm_over),
                        tools=tools,
                        memory=[mem],
                        model_client_stream=True,
                    )

                return _make

            self.child[a["name"]] = {
                "make_agent": _factory(),
                "is_rag": bool(a.get("is_rag_agent")),
                "index": a.get("index_name"),
                "mcp": a.get("mcp"),
            }

        docs = "\n".join(f"- {n}" for n in self.child)
        router_sys = (
            spec["router"]["system_message"]
            + "\n\nAvailable agents:\n"
            + docs
            + '\n\nReturn {"agent": "<Name>"} only.'
        )

        def _router_factory(llm_over=spec["router"].get("llm_config_overrides", {})):
            def _make(mem: ListMemory):
                return AssistantAgent(
                    name="Router",
                    system_message=router_sys,
                    model_client=chat_client(llm_over),
                    tools=[],
                    memory=[mem],
                    model_client_stream=False,
                )

            return _make

        self.router = {"make_agent": _router_factory()}

    # --------------------------------------------------------------------- #
    # async helpers to fetch MCP tool lists
    # --------------------------------------------------------------------- #
    async def fetch_tools(self, name: str) -> List[Any]:
        cfg = self.child[name]
        if not cfg["mcp"]:
            return []
        if cfg["mcp"]["type"] == "sse":
            return await mcp_server_tools(
                SseServerParams(
                    url=cfg["mcp"]["url"],
                    headers=cfg["mcp"].get("headers", {}),
                    timeout=cfg["mcp"].get("timeout", 30),
                )
            )
        elif cfg["mcp"]["type"] == "streamable-http":
            return await mcp_server_tools(
                StreamableHttpServerParams(
                    url=cfg["mcp"]["url"],
                    headers=cfg["mcp"].get("headers", {}),
                    timeout=cfg["mcp"].get("timeout", 30),
                )
            )
