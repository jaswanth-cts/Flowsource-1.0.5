"""
Vision analyzer: calls Azure OpenAI GPT-4o with text+image content parts,
returns a concise textual summary (VISION CONTEXT).
"""

from __future__ import annotations
from typing import List, Dict
from .llm import azure_raw_client
from .config import AZ_DEPLOYMENT, VISION_SYSTEM_PROMPT

__all__ = ["VisionAnalyzer"]

class VisionAnalyzer:
    def __init__(self) -> None:
        self.model = AZ_DEPLOYMENT

    async def summarize(self, user_prompt: str, image_parts: List[Dict]) -> str:
        """
        image_parts: list of {"type":"image_url", "image_url":{"url": "..."}}
        """
        content = [{"type":"text","text":user_prompt}] + image_parts
        # Azure's Python SDK supports async via await? The official AzureOpenAI
        # client is synchronous. Wrap in a thread if needed—here we call sync.
        resp = azure_raw_client.chat.completions.create(
            model=self.model,
            messages=[
                {"role":"system","content": VISION_SYSTEM_PROMPT},
                {"role":"user",  "content": content},
            ],
            temperature=0,
        )
        print(resp)
        return resp.choices[0].message.content or ""
