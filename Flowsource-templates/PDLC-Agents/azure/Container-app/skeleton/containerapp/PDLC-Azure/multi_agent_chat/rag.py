"""
Hybrid RAG helpers (Azure AI Search + optional local embeddings).
"""

from __future__ import annotations
from typing import List, Dict
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
from azure.search.documents.models import VectorizableTextQuery, VectorizedQuery

from .config import (
    SEARCH_ENDPOINT, SEARCH_KEY, SEARCH_RETRY,
    VECTOR_MODE, MAX_CONTEXT_TOKENS, tokens,
)
from .llm import local_embed

__all__ = ["SearchHelper", "pretty_ctx"]

class SearchHelper:
    """Thin wrapper around Azure AI Search index."""
    def __init__(self, index_name: str):
        self.cli = SearchClient(
            endpoint=SEARCH_ENDPOINT,
            index_name=index_name,
            credential=AzureKeyCredential(SEARCH_KEY),
            retry_policy=SEARCH_RETRY,
        )

    def hybrid_records(self, q: str, k: int = 3) -> List[Dict]:
        if VECTOR_MODE == "local":
            vq = VectorizedQuery(
                vector=local_embed(q), k_nearest_neighbors=k, fields="contentVector"
            )
            res = self.cli.search(search_text=q, vector_queries=[vq], top=k)
        else:
            vq = VectorizableTextQuery(
                text=q, k_nearest_neighbors=k, fields="contentVector"
            )
            res = self.cli.search(search_text=q, vector_queries=[vq], top=k)
        return [{"source": d["filename"], "content": d["content"]} for d in res]

    def trimmed_records(self, q: str) -> List[Dict]:
        recs, used, out = self.hybrid_records(q), 0, []
        for r in recs:
            t = tokens(r["content"])
            if used + t > MAX_CONTEXT_TOKENS:
                break
            out.append(r); used += t
        return out

def pretty_ctx(recs):                             # tiny util, keeps imports tidy
    return "\n\n".join(f"[{r['source']}]\n{r['content']}" for r in recs)
