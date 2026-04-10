"""
Entry-point for local dev:  `python -m multi_agent_chat.main`
"""

import uvicorn
from .api import build_app

app = build_app()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8017)
