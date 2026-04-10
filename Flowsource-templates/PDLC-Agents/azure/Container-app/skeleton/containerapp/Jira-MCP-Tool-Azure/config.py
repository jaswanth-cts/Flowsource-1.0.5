# config.py
import os
import sys
from azure.keyvault.secrets import SecretClient
from azure.identity import ManagedIdentityCredential
from dotenv import load_dotenv

# Load .env first
load_dotenv()

# ── Helper functions ─────────────────────────────────────────────
def env(key: str) -> str:
    """Get an environment variable or exit if missing"""
    value = os.getenv(key)
    if not value:
        sys.exit(f"Missing env var {key}")
    return value.strip('"')  # Strip quotes if present in .env

def get_kv_client() -> SecretClient:
    """Create a KeyVault SecretClient using User-Assigned Managed Identity"""
    endpoint = env("AZURE_KEYVAULT_ENDPOINT")
    client_id = env("AZURE_KEYVAULT_CLIENT_ID")
    credential = ManagedIdentityCredential(client_id=client_id)
    return SecretClient(vault_url=endpoint, credential=credential)

def kv_secret(name: str) -> str:
    """Fetch a secret from KeyVault safely"""
    client = get_kv_client()
    try:
        secret = client.get_secret(name)
        if not secret or not secret.value:
            sys.exit(f"Missing KeyVault secret {name}")
        return secret.value
    except Exception as e:
        sys.exit(f"Failed to fetch KeyVault secret '{name}': {e}")

# ── Jira Config ────────────────────────────────────────────────
class JiraConfig:
    def __init__(self):
        self.base_url = env("JIRA_URL").rstrip("/")
        self.email = kv_secret("JIRA-EMAIL")
        self.token = kv_secret("JIRA-API-TOKEN")
        self.project_key = env("JIRA_PROJECT_KEY")
