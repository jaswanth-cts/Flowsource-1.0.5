"""
Transforms uploaded images or URLs into vision-friendly parts.

- Uploaded files -> data URLs (base64) so they work without hosting.
- Optional URL list -> passed through as image_url parts.
"""

from __future__ import annotations
from typing import List, Dict
import base64

from .config import VISION_MAX_IMAGES

__all__ = ["to_vision_parts", "urls_to_parts"]

def to_vision_parts(files: List[bytes], mimes: List[str]) -> List[Dict]:
    """
    Returns list of parts suitable for Azure Chat content, e.g.:
      {"type":"image_url", "image_url":{"url": "data:image/png;base64,..." }}
    """
    parts: List[Dict] = []
    for i, (raw, mt) in enumerate(zip(files, mimes)):
        if i >= VISION_MAX_IMAGES:
            break
        b64 = base64.b64encode(raw).decode("utf-8")
        parts.append({
            "type": "image_url",
            "image_url": {"url": f"data:{mt};base64,{b64}"},
        })
    return parts

def urls_to_parts(urls: List[str]) -> List[Dict]:
    """
    Builds parts from plain URLs (http/https/data). Truncated to VISION_MAX_IMAGES.
    """
    out: List[Dict] = []
    for u in urls[:VISION_MAX_IMAGES]:
        out.append({"type": "image_url", "image_url": {"url": u}})
    return out