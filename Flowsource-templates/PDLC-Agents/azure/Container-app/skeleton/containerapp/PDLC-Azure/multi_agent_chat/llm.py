from __future__ import annotations
from typing import Dict, Any, List
from autogen_ext.models.openai import AzureOpenAIChatCompletionClient
from openai import AzureOpenAI
from .config import AZ_ENDPOINT, AZ_KEY, AZ_API_VER, AZ_DEPLOYMENT, VECTOR_MODE, EMBED_MODEL, VECTOR_DIM

__all__ = ["chat_client", "local_embed", "azure_raw_client"]

def chat_client(overrides: Dict[str, Any] | None = None) -> AzureOpenAIChatCompletionClient:
    cfg = {"model": AZ_DEPLOYMENT, "temperature": 0, **(overrides or {})}
    return AzureOpenAIChatCompletionClient(
        model=cfg["model"],
        azure_deployment=AZ_DEPLOYMENT,
        azure_endpoint=AZ_ENDPOINT,
        api_key=AZ_KEY,
        api_version=AZ_API_VER,
        temperature=cfg["temperature"],
        timeout=60,
    )

azure_raw_client = AzureOpenAI(
    azure_endpoint=AZ_ENDPOINT,
    api_key=AZ_KEY,
    api_version=AZ_API_VER,
    max_retries=6
)

def local_embed(text: str) -> List[float]:
    resp = azure_raw_client.embeddings.create(
        model=EMBED_MODEL,
        input=[text],
        dimensions=VECTOR_DIM
    )
    return resp.data[0].embedding