# config.py
import os
import sys
from azure.keyvault.secrets import SecretClient
from azure.identity import ManagedIdentityCredential
from dotenv import load_dotenv

# Load .env first
load_dotenv()

# ── Helpers ────────────────────────────────────────────────
def env(key: str) -> str:
    """Get environment variable or exit if missing"""
    value = os.getenv(key)
    if not value:
        sys.exit(f"Missing env var {key}")
    return value.strip('"')  # Strip quotes from .env if present

def get_kv_client() -> SecretClient:
    """Create a KeyVault client at runtime"""
    endpoint = env("AZURE_KEYVAULT_ENDPOINT")
    client_id = env("AZURE_KEYVAULT_CLIENT_ID")
    credential = ManagedIdentityCredential(client_id=client_id)
    return SecretClient(vault_url=endpoint, credential=credential)

def kv_secret(name: str) -> str:
    """Retrieve a secret safely from Key Vault"""
    client = get_kv_client()
    try:
        secret = client.get_secret(name)
        if not secret or not secret.value:
            sys.exit(f"Missing KeyVault secret {name}")
        return secret.value
    except Exception as e:
        sys.exit(f"Failed to fetch KeyVault secret '{name}': {e}")

# ── GitHub Configuration ─────────────────────────────────
class GitHubConfig:
    def __init__(self):
        self.owner = env("GITHUB_OWNER")
        self.default_repo = env("GITHUB_DEFAULT_REPO")
        self.token = kv_secret("GITHUB-PERSONAL-ACCESS-TOKEN")
