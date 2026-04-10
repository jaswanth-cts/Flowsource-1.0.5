# models.py
from pydantic import BaseModel
from typing import List

# ────────────────────────── Response models ────────────────────────────────
class FileResponse(BaseModel):
    message: str
    repository: str
    path: str
    branch: str

class PushResponse(BaseModel):
    message: str
    repository: str
    branch: str
    commit_sha: str
    files: List[str]

class IssueSummary(BaseModel):
    number: int
    title: str
    state: str
    url: str

class PRSummary(BaseModel):
    number: int
    title: str
    state: str
    url: str