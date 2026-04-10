# GitHub MCP Server

A Model Context Protocol (MCP) server that exposes GitHub repository operations (files, issues, pull requests) as MCP tools via FastMCP.

- Transport: `sse` (Server-Sent Events)
- Default host/port: `0.0.0.0:7034` (configurable via `PORT`)

## Features (Tools)
The server registers GitHub-specific tools via `fastmcp` (see `tools.py`).

- Files
  - `github-createFile(path, content, message, branch)`
  - `github-updateFile(path, content, message, branch)`
  - `github-pushFiles(files: {path: content}, message, branch)` / `github-commitCode(files, branch, message?)`
  - `github-getFileContents(path, branch='main')`
  - `github-listBranches()`
- Issues
  - `github-listOpenIssues()`
  - `github-createIssue(title, body?)`
  - `github-getIssue(number)`
  - `github-addIssueComment(number, body)`
- Pull Requests
  - `github-createPullRequest(head, base, title, body?)`
  - `github-listPullRequests(state='open')`
  - `github-addPullRequestComment(number, body)`
  - `github-editPullRequestComment(comment_id, body)`
  - `github-getPullRequest(number)`
- Health
  - `github-healthCheck()`

All operations are performed against a single configured repository.

## Prerequisites
- Python 3.11+
- Azure account with Key Vault and User-Assigned Managed Identity
- GitHub Personal Access Token (classic or fine-grained)
  - Minimum scopes: `repo` (for private repos), `public_repo` for public-only. Add `read:org` if needed.
- Docker (optional, for containerized run)

## Configuration
Configuration is loaded from environment variables (see `config.py`) and `.env` via `python-dotenv`. Secrets are securely stored in Azure Key Vault.

### Required Environment Variables
- `GITHUB_OWNER`: GitHub org/user, e.g. `octocat`
- `GITHUB_DEFAULT_REPO`: Repository name, e.g. `hello-world`
- `AZURE_KEYVAULT_ENDPOINT`: The URI of your Azure Key Vault (e.g., `https://your-keyvault-name.vault.azure.net`)
- `AZURE_KEYVAULT_CLIENT_ID`: The Client ID of the User-Assigned Managed Identity

### Optional Environment Variables
- `PORT` (default `7034`)

### Azure Key Vault Secrets
The following secrets must be stored in your Azure Key Vault:
- `GITHUB-PERSONAL-ACCESS-TOKEN`: Your GitHub Personal Access Token

### Required Permissions
- The User-Assigned Managed Identity must have `Get` and `List` permissions for secrets in the specified Key Vault.

You can copy and edit `.env.example`:

```bash
cp .env.example .env
# then fill values
```

Example `.env`:
```env
# Required
GITHUB_OWNER=your-org-or-user
GITHUB_DEFAULT_REPO=your-repo
AZURE_KEYVAULT_ENDPOINT=https://your-keyvault-name.vault.azure.net
AZURE_KEYVAULT_CLIENT_ID=00000000-0000-0000-0000-000000000000

# Optional
PORT=7034
```

> **Note**: The GitHub Personal Access Token is now stored securely in Azure Key Vault as a secret named `GITHUB-PERSONAL-ACCESS-TOKEN`.

## Local Setup & Run
1) Create and activate a virtual environment (recommended):

- Windows (PowerShell):
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2) Install dependencies:
```bash
pip install --no-deps -r requirements.txt
```

3) Configure environment (create `.env` as above) and run the server:
```bash
python server.py
```

Logs will report: "Starting MCP server on port <PORT>...".

## Using Makefile (Docker workflow)
The provided `Makefile` wraps Docker commands. Ensure you have a `.env` file next to the `Makefile`.

Targets:
- `make build` — Build image `github-mcp-u`
- `make run` — Run container `github-mcp` with `-p $PORT:7034` and `--env-file .env`
- `make stop` — Stop the container
- `make remove` — Remove the container
- `make stop-remove` — Stop then remove
- `make restart` — Recreate and run
- `make logs` — Follow container logs

## Docker (manual)
Build and run without Makefile:
```bash
docker build -t github-mcp-u .
# Expose your desired port, default .env PORT is used by Makefile; here we map host 7034->container 7034
docker run -d --name github-mcp \
  --restart unless-stopped \
  -p 7034:7034 \
  --env-file .env \
  github-mcp-u
```

## How the server selects the repository
`client.py` loads `GitHubConfig` from `config.py`:
- repository is `{GITHUB_OWNER}/{GITHUB_DEFAULT_REPO}`
- all tools operate on this repository
- operations can target different branches via tool parameters

## Health check
Call tool `github-healthCheck()` to verify the service is responsive.

## Troubleshooting
- Invalid or missing `PORT` will stop the server on start (see `server.py`). Ensure `PORT` is numeric.
- 404 errors for files usually indicate the path or branch does not exist. Create branches or files as needed.
- Authentication errors: verify `GITHUB_PERSONAL_ACCESS_TOKEN` scopes and that the token is not expired or restricted by SSO.
- Network issues from containers: ensure your host firewall allows inbound traffic on the chosen port.

## Development notes
- Entry point: `server.py` (uses `FastMCP.run(transport='sse', host='0.0.0.0', port=PORT)`).
- Tools registry: `tools.py` delegates to `GitHubClient` in `client.py`.
- Configuration: `config.py` handles environment variables and Azure Key Vault integration.
- Models and error types: see `models.py` and `exceptions.py`.

## Security Notes
- **Secret Management**: All secrets are stored in Azure Key Vault and accessed at runtime using Managed Identity.
- **Network Security**: Ensure proper Network Security Groups (NSGs) and Private Endpoints are configured for Azure Key Vault access in production.
- **Identity and Access**: The application uses a User-Assigned Managed Identity with least privilege access to Key Vault secrets.
