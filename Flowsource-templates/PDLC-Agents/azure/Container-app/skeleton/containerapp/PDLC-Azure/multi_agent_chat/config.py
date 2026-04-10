"""
Centralised runtime configuration (env-driven).
"""

from __future__ import annotations
import os, tiktoken, sys
from azure.core.pipeline.policies import RetryPolicy
from azure.keyvault.secrets import SecretClient
from azure.identity import ManagedIdentityCredential
from dotenv import load_dotenv
load_dotenv()

ENCODER = tiktoken.get_encoding("cl100k_base")
env = lambda k: (v := os.getenv(k)) or sys.exit(f"Missing env var {k}")
kv_secret = lambda k: (v := KV_CLIENT.get_secret(k).value) or sys.exit(f"Missing KeyVault secret {k}")

# ── Azure KeyVault credentials ---------------------------------
KV_ENDPOINT = env("AZURE_KEYVAULT_ENDPOINT")
KV_CLIENT_ID = env("AZURE_KEYVAULT_CLIENT_ID")
KV_CRED = ManagedIdentityCredential(client_id=KV_CLIENT_ID)
KV_CLIENT = SecretClient(KV_ENDPOINT, credential=KV_CRED)

# ----- global budgets -------------------------------------------------------
MAX_HISTORY_TOKENS = int(os.getenv("MAX_HISTORY_TOKENS", "12000"))
MAX_CONTEXT_TOKENS = int(os.getenv("MAX_CONTEXT_TOKENS", "20000"))
MAX_TOTAL_TOKENS   = int(os.getenv("MAX_TOTAL_TOKENS",  "120000"))
MAX_DB_ROWS        = int(os.getenv("PG_HISTORY_LIMIT",  "10"))

# Vision knobs
VISION_MAX_IMAGES       = int(os.getenv("VISION_MAX_IMAGES", "4"))
VISION_USE_DATA_URLS    = os.getenv("VISION_USE_DATA_URLS", "true").lower() == "true"
VISION_SYSTEM_PROMPT    = os.getenv("VISION_SYSTEM_PROMPT",
    "From the images, extract query-relevant facts only: OCR text, entities/objects, numbers, charts/diagrams, relationships, anomalies. Link findings to the question, note uncertainty, and avoid speculation."
)

# ----- Azure OpenAI ---------------------------------------------------------
AZ_ENDPOINT   = kv_secret("AZURE-OPENAI-ENDPOINT")
AZ_KEY        = kv_secret("AZURE-OPENAI-API-KEY")
AZ_API_VER    = os.getenv("AZURE_OPENAI_API_VERSION", "2024-06-01")
AZ_DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4o")


EMBED_MODEL   = os.getenv("AZURE_OPENAI_EMBED_DEPLOYMENT", "text-embedding-3-large")
VECTOR_MODE   = os.getenv("VECTOR_PIPELINE_MODE", "local").lower()           # local|service
VECTOR_DIM    = 3072

# ----- Azure AI Search -------------------------------------------------------
SEARCH_ENDPOINT = kv_secret("AZURE-SEARCH-ENDPOINT")
SEARCH_KEY      = kv_secret("AZURE-SEARCH-API-KEY")
SEARCH_RETRY    = RetryPolicy(total_retries=6, retry_backoff_factor=2)

# ----- Cosmos DB-for-PostgreSQL --------------------------------------------
PG_HOST, PG_PORT, PG_DB, PG_USER, PG_PASSWORD = (
    kv_secret("PG-HOST"),
    int(os.getenv("PG_PORT", "5432")),
    kv_secret("PG-DB"),
    kv_secret("PG-USER"),
    kv_secret("PG-PASSWORD"),
)

# ----- helpers --------------------------------------------------------------
def tokens(txt: str) -> int:
    return len(ENCODER.encode(txt))
