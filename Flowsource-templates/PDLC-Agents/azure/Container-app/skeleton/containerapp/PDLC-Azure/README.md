# Azure Multi-Agent System (PDLC)

This repository contains a multi-agent FastAPI service for PDLC workflows (user story creation, Jira, test cases, knowledge, etc.). It integrates with Azure OpenAI, Azure AI Search, Azure Key Vault, and Cosmos DB for PostgreSQL.

The service entrypoint is `multi_agent_chat/main.py`, which builds a FastAPI app and starts Uvicorn.


## Features
- Multiple specialized agents configured via `agents_config.json`
- Azure OpenAI for chat and embeddings
- Azure AI Search (RAG-enabled agents)
- Cosmos DB for PostgreSQL to store chat history
- Azure Key Vault for secret management via Managed Identity
- REST API via FastAPI/Uvicorn


## Repository Structure
- `multi_agent_chat/`
  - `main.py` – app entrypoint (`python -m multi_agent_chat.main`)
  - `api.py` – FastAPI app factory `build_app()`
  - `config.py` – centralized env- and Key Vault–driven configuration
  - `.env.example` – environment variables template
- `agents_config.json` – router/agents configuration
- `requirements.txt` – Python dependencies
- `Dockerfile` – container image definition
- `Makefile` – common tasks (optional to use)


## Prerequisites
- Azure subscription with the following resources set up:
  - Azure Key Vault (for secrets)
  - Azure OpenAI resource and a model deployment (e.g., `gpt-4o`)
  - Azure AI Search service and indexes for RAG agents (optional but recommended)
  - Cosmos DB for PostgreSQL cluster (optional if you plan to persist chat history)
- A Managed Identity (user-assigned) with access to Key Vault secrets
- Python (matching your environment; create a virtual environment is recommended)


## Key Vault Secrets Required
`multi_agent_chat/config.py` pulls these secrets from Key Vault. Create the following secrets in your Key Vault with exact names:
- `AZURE-OPENAI-ENDPOINT`
- `AZURE-OPENAI-API-KEY`
- `AZURE-SEARCH-ENDPOINT`
- `AZURE-SEARCH-API-KEY`
- `PG-HOST`
- `PG-DB`
- `PG-USER`
- `PG-PASSWORD`

Grant your user-assigned Managed Identity get/list permissions for these secrets.


## Environment Variables
Copy `.env.example` to `.env` and fill the values. Minimum required for local development (read by `config.py`):

- Azure Key Vault
  - `AZURE_KEYVAULT_ENDPOINT` – your KV URI, e.g., `https://<kv-name>.vault.azure.net/`
  - `AZURE_KEYVAULT_CLIENT_ID` – client ID of the user-assigned managed identity with access to Key Vault

- Azure OpenAI
  - `AZURE_OPENAI_DEPLOYMENT` – the chat/completions model deployment name (default in code: `gpt-4o`)
  - `AZURE_OPENAI_API_VERSION` – optional; defaults to `2024-06-01` if not set

- Embeddings / Search
  - `AZURE_OPENAI_EMBED_DEPLOYMENT` – embeddings deployment name (default in code: `text-embedding-3-large`)

- History/Context budgets (optional)
  - `MAX_HISTORY_TOKENS` – default `12000`
  - `MAX_CONTEXT_TOKENS` – default `20000`
  - `MAX_TOTAL_TOKENS` – default `120000`
  - `PG_HISTORY_LIMIT` – default `10`

- Vision (optional)
  - `VISION_MAX_IMAGES` – default `4`
  - `VISION_USE_DATA_URLS` – default `true`
  - `VISION_SYSTEM_PROMPT` – optional override

- PostgreSQL (port only; the rest come from Key Vault)
  - `PG_PORT` – defaults to `5432` if omitted

Note: `.env.example` includes additional optional knobs (e.g., `AZURE_SEARCH_INDEX`, UI parameters). Fill them if used by your app layer.


## Agents Configuration
`agents_config.json` defines:
- A `router` agent that picks a specialist agent
- A list of `agents` with fields:
  - `name`, `description`, `system_message`
  - `is_rag_agent` and `index_name` (for RAG-backed agents)
  - `llm_config_overrides` (e.g., `temperature`, `max_tokens`)
  - Optional `mcp` section for tool servers (e.g., Jira, GitHub)

Update `index_name` values to point to your Azure AI Search indexes. Update `mcp.url` to your tool endpoints.


## Setup
1) Create and activate a virtual environment
- Windows (PowerShell):
  ```powershell
  python -m venv .venv
  .venv\Scripts\Activate.ps1
  ```

2) Install dependencies
```bash
pip install --no-deps -r requirements.txt
```

3) Configure environment
- Copy `.env.example` to `multi_agent_chat/.env` (or project root) and fill in variables
- Ensure Key Vault secrets exist and your Managed Identity has access

4) Verify agents config
- Adjust `agents_config.json` for your indexes and tool endpoints


## Running Locally
Option A: Python module
```bash
python -m multi_agent_chat.main
```
This runs Uvicorn on `http://0.0.0.0:8017` per `multi_agent_chat/main.py`.

Option B: Uvicorn directly
```bash
uvicorn multi_agent_chat.main:app --host 0.0.0.0 --port 8017 --reload
```


## Running in Docker
Build the image:
```bash
docker build -t az-multi-agent:latest .
```
Run (mount env file or pass envs explicitly):
```bash
docker run --rm -p 8017:8017 \
  --env-file multi_agent_chat/.env \
  az-multi-agent:latest
```
If using Managed Identity from Azure, configure your hosting environment accordingly (Container Apps/AKS with MSI and Key Vault access policies).


## API
The FastAPI application is built by `multi_agent_chat/api.py` via `build_app()`. Common patterns:
- Health check route
- Conversation endpoints (router + specialist agents)

Use your browser or tools like curl/Postman to interact with the exposed endpoints. If an OpenAPI schema is enabled, navigate to `/docs` in the running service.


## Troubleshooting
- Missing env/secret errors
  - `config.py` will exit with messages like `Missing env var <NAME>` or `Missing KeyVault secret <NAME>`
  - Confirm `.env` values and Key Vault secret names match exactly

- Authentication to Key Vault fails
  - Verify `AZURE_KEYVAULT_CLIENT_ID` points to a user-assigned identity
  - Ensure that identity has Key Vault access policies or RBAC permissions

- Azure OpenAI errors
  - Check model deployment names in `.env`
  - Ensure endpoint/key secrets in Key Vault are correct

- Azure Search errors
  - Confirm index names in `agents_config.json`
  - Ensure search endpoint/key secrets exist in Key Vault

- Database errors
  - Confirm `PG_*` Key Vault secrets and `PG_PORT`


## Security Notes
- Do not commit real secrets. Use Key Vault and environment variables.
- Restrict Key Vault access to the required identities only.
