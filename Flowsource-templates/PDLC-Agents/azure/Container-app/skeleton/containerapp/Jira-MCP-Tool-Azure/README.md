# Jira MCP Server

A Model Context Protocol (MCP) server exposing Jira operations (create/update issues, link to epic, add comments, query issues) via FastMCP.

## Features

- Jira issue CRUD helpers exposed as MCP tools via `fastmcp` (see `tools.py`).
- Simple HTTP transport (`streamable-http`) via `FastMCP` in `server.py`.
- Dockerized deployment with minimal base image.
- Environment-based configuration via `.env` and `python-dotenv`.

## Requirements

- Python 3.11+
- Jira Cloud account with API token
- Docker (optional, for containerized run)
- Make (optional; you can run Docker commands directly on Windows if you don't have `make`)

## Configuration

### Azure Key Vault Setup

This application uses Azure Key Vault for secure secret management. Follow these steps to set up:

1. **Create an Azure Key Vault** in your Azure subscription
2. **Create the following secrets in your Key Vault**:
   - `JIRA-EMAIL` - Your Jira account email
   - `JIRA-API-TOKEN` - Jira API token created from your Atlassian account

### Environment Variables

Create a `.env` file based on `.env.example` in the repo root. Required variables (see `config.py`):

- `JIRA_URL` — Base URL to your Jira Cloud site (e.g., `https://your-org.atlassian.net`).
- `JIRA_PROJECT_KEY` — Default project key, e.g., `ENG`.
- `PORT` — Port to run the MCP server on (defaults to `7035` if not set).
- `AZURE_KEYVAULT_ENDPOINT` — The URI of your Azure Key Vault (e.g., `https://your-keyvault-name.vault.azure.net`).
- `AZURE_KEYVAULT_CLIENT_ID` — The Client ID of the User-Assigned Managed Identity that has access to the Key Vault.

Example `.env`:

```
JIRA_URL=https://your-org.atlassian.net
JIRA_PROJECT_KEY=ENG
PORT=7035
AZURE_KEYVAULT_ENDPOINT=https://your-keyvault-name.vault.azure.net
AZURE_KEYVAULT_CLIENT_ID=your-managed-identity-client-id
```

### Required Permissions

Ensure the Managed Identity has the following permissions in Azure Key Vault:
- `Get` and `List` permissions for secrets

## Local Development

1. Create and activate a virtual environment
   - Windows (PowerShell):
     ```powershell
     python -m venv .venv
     .\.venv\Scripts\Activate.ps1
     ```
   - macOS/Linux:
     ```bash
     python -m venv .venv
     source .venv/bin/activate
     ```

2. Install dependencies
   ```bash
   pip install --no-deps -r requirements.txt
   ```

3. Create `.env` from `.env.example` and fill in values (see Configuration).

4. Run the server
   ```bash
   python server.py
   ```
   The server binds to `0.0.0.0` on the configured `PORT` (default `7035`).

## Docker

Build and run with Docker directly:

```bash
# Build
docker build -t jira-mcp-u .

# Run (ensure .env exists in the current directory)
docker run -d --name jira-mcp \
  --restart unless-stopped \
  -p 7035:7035 \
  --env-file .env \
  jira-mcp-u
```

Or use the provided `Makefile` targets (requires `make`):

- `make build` — build image `jira-mcp-u`.
- `make run` — run container `jira-mcp` mapping `PORT` from `.env` to `7035` in the container.
- `make stop` — stop container.
- `make remove` — remove container.
- `make restart` — stop+remove then run.
- `make logs` — follow container logs.

Note: On Windows without `make`, use the Docker commands above. If your host port differs, set `PORT` in `.env` and edit the `-p` mapping accordingly.

## Available MCP Tools

Defined in `tools.py` and powered by `client.py`:

- `jira-createIssue`
  - Args: `summary` (str), `description` (str, optional), `issue_type` (str, default "story"), `priority` (str, optional), `epic_name` (str, only for epics)
  - Returns JSON string with created key and URL.

- `jira-updateIssue`
  - Args: `issue_key` (str), `summary` (optional), `description` (optional), `priority` (optional)
  - Updates one or more fields.

- `jira-linkIssueToEpic`
  - Args: `issue_key` (str), `epic_key` (str)
  - Links an issue to an epic.

- `jira-addComment`
  - Args: `issue_key` (str), `comment` (str)

- `jira-getIssue`
  - Args: `issue_key` (str)
  - Returns JSON with key, summary, status, priority, description.

- `jira-searchIssues`
  - Args: `jql` (str), `max_results` (int, default 10)

- `jira-healthCheck`
  - Returns a simple health string.

All tool functions return JSON strings for easier consumption by MCP clients.

## How it Works

- `server.py` initializes `FastMCP` and exposes tools over the `streamable-http` transport on `PORT`.
- `tools.py` registers tool handlers that call into `JiraClient` methods.
- `client.py` wraps Jira REST API v3 using `requests` and environment configuration from `config.py`.

## Using with an MCP Client

- Start the server (locally or in Docker) and configure your MCP-capable client to connect to the server's host/port using the `streamable-http` transport.
- Authentication is currently not enabled in `server.py` (the `BearerAuthProvider` stub is present but commented). If you need auth, wire it up and provide keys via environment variables before exposing publicly.

## Troubleshooting

- Ensure `.env` has correct `JIRA_URL`, `JIRA_PROJECT_KEY`, `AZURE_KEYVAULT_ENDPOINT`, and `AZURE_KEYVAULT_CLIENT_ID`.
- Verify the Managed Identity has proper access to the Key Vault and required secrets exist.
- Verify your Jira user has permissions to create/update issues in `JIRA_PROJECT_KEY`.
- If you see "Invalid issue type" or "Invalid priority" from tools, check available types/priorities in your Jira project.
- Port conflicts: change `PORT` in `.env` and restart.
- Network/DNS issues: ensure your environment can reach your Atlassian domain.

## Security Notes

- Do not commit `.env` with secrets. `.gitignore` already excludes it.
- If exposing outside localhost, enable auth in `server.py` (see commented `BearerAuthProvider`).
- Ensure proper Network Security Groups (NSGs) and Private Endpoints are configured for Azure Key Vault access in production environments.
- Regularly rotate your Jira API token and update it in Azure Key Vault.

## Project Structure

- `server.py` — starts the MCP server and registers tools.
- `tools.py` — defines and registers MCP tools.
- `client.py` — Jira REST client with helpers.
- `config.py` — loads environment variables.
- `requirements.txt` — Python dependencies.
- `Dockerfile` — container image definition.
- `Makefile` — convenience targets for Docker lifecycle.
