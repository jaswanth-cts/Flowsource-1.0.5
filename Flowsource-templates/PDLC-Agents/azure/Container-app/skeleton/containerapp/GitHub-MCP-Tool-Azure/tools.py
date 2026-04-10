# tools.py
import asyncio
from typing import Annotated, Dict, List, Optional

from pydantic import Field
from fastmcp import FastMCP
from fastmcp.exceptions import ToolError

from client import GitHubClient
from models import FileResponse, IssueSummary, PRSummary, PushResponse
from exceptions import GitHubValidationError

_github = GitHubClient()

# ───────────────────────────── Tool registry ───────────────────────────────
def register_tools(mcp: FastMCP) -> None:
    # --------------- FILES ---------------
    @mcp.tool(
        name="github-createFile",
        description="Create a new file specifically in a GitHub repository. For GitHub operations only - adds a single file to a GitHub repo.",
        tags={"github-specific", "github-write", "gh-file-create"},
    )
    async def create_file(
        path: Annotated[str, Field(description="File path, e.g. 'README.md' or 'src/main.py'")],
        content: Annotated[str, Field(description="File contents/code to write")],
        message: Annotated[str, Field(description="Commit message describing the change")],
        branch: Annotated[str, Field(description="Target branch name (e.g. 'main', 'test', 'feature-branch')")],
    ) -> FileResponse:
        try:
            return await asyncio.to_thread(
                _github.create_file, path, content, message, branch
            )
        except GitHubValidationError as e:
            raise ToolError(str(e))

    @mcp.tool(
        name="github-updateFile",
        description="Update an existing file specifically in a GitHub repository. For GitHub operations only - modifies content of files already in a GitHub repo.",
        tags={"github-specific", "github-write", "gh-file-update", "gh-edit"},
    )
    async def update_file(
        path: Annotated[str, Field(description="Path to existing file to update")],
        content: Annotated[str, Field(description="New file content/code")],
        message: Annotated[str, Field(description="Commit message describing the changes")],
        branch: Annotated[str, Field(description="Branch name to update the file on")],
    ) -> FileResponse:
        return await asyncio.to_thread(
            _github.update_file, path, content, message, branch
        )

    @mcp.tool(
        name="github-pushFiles",
        description="Commit and push multiple files to a GitHub repository branch in one operation. For GitHub operations only - use for multi-file GitHub commits.",
        tags={"github-specific", "github-write", "gh-commit", "gh-push", "gh-batch"},
    )
    async def push_files(
        files: Annotated[
            Dict[str, str], 
            Field(description="Dictionary mapping file paths to their content. Example: {'main.py': 'print(hello)', 'README.md': '# My Project'}")
        ],
        message: Annotated[str, Field(description="Commit message for all files")],
        branch: Annotated[str, Field(description="Target branch name")],
    ) -> PushResponse:
        return await asyncio.to_thread(_github.push_files, files, message, branch)

    @mcp.tool(
        name="github-commitCode",
        description="Commit code changes to a specific GitHub branch. GitHub-specific alias for pushFiles - use for GitHub commit operations only.",
        tags={"github-specific", "github-write", "gh-commit", "gh-branch"},
    )
    async def commit_code(
        files: Annotated[
            Dict[str, str], 
            Field(description="Code files to commit - mapping of file paths to content")
        ],
        branch: Annotated[str, Field(description="Branch to commit to")],
        message: Annotated[str, Field(description="Commit message")] = "Code commit via MCP",
    ) -> PushResponse:
        return await asyncio.to_thread(_github.push_files, files, message, branch)

    @mcp.tool(
        name="github-getFileContents",
        description="Read and return the contents of a file specifically from a GitHub repository. For GitHub operations only.",
        tags={"github-specific", "github-read", "gh-fetch", "gh-contents"},
    )
    async def get_file_contents(
        path: Annotated[str, Field(description="Path to the file to read")],
        branch: Annotated[str, Field(description="Branch to read from")] = "main",
    ) -> str:
        return await asyncio.to_thread(_github.get_file_contents, path, branch)

    @mcp.tool(
        name="github-listBranches",
        description="List all available branches in a GitHub repository. For GitHub operations only - retrieves GitHub branch information.",
        tags={"github-specific", "github-read", "gh-branches", "gh-list"},
    )
    async def list_branches() -> List[str]:
        return await asyncio.to_thread(_github.list_branches)

    # --------------- ISSUES ---------------
    @mcp.tool(
        name="github-listOpenIssues",
        description="Get a list of currently open GitHub issue numbers in the repository. For GitHub operations only.",
        tags={"github-specific", "github-read", "gh-issues", "gh-open-issues"},
    )
    async def list_open_issues() -> List[int]:
        return await asyncio.to_thread(_github.list_open_issues)

    @mcp.tool(
        name="github-createIssue",
        description="Create a new issue in a GitHub repository. For GitHub operations only - creates GitHub issues.",
        tags={"github-specific", "github-write", "gh-issue-create", "gh-bug", "gh-feature"},
    )
    async def create_issue(
        title: Annotated[str, Field(description="Issue title/summary")],
        body: Annotated[Optional[str], Field(description="Issue description in Markdown")] = None,
    ) -> int:
        return await asyncio.to_thread(_github.create_issue, title, body)

    @mcp.tool(
        name="github-getIssue",
        description="Get details of a specific GitHub issue by its number. For GitHub operations only - retrieves GitHub issue information.",
        tags={"github-specific", "github-read", "gh-issue-details"},
    )
    async def get_issue(
        number: Annotated[int, Field(description="Issue number to fetch")],
    ) -> IssueSummary:
        return await asyncio.to_thread(_github.get_issue, number)

    @mcp.tool(
        name="github-addIssueComment",
        description="Add a comment to an existing GitHub issue. For GitHub operations only - adds comments to GitHub issues.",
        tags={"github-specific", "github-write", "gh-issue-comment"},
    )
    async def add_issue_comment(
        number: Annotated[int, Field(description="Issue number to comment on")],
        body: Annotated[str, Field(description="Comment text/content")],
    ) -> str:
        return await asyncio.to_thread(_github.add_issue_comment, number, body)

    # --------------- PULL REQUESTS ---------------
    @mcp.tool(
        name="github-createPullRequest",
        description="Create a GitHub pull request to merge one branch into another. For GitHub operations only - creates PRs in GitHub repositories.",
        tags={"github-specific", "github-write", "gh-pr-create", "gh-pull", "gh-merge"},
    )
    async def create_pr(
        head: Annotated[str, Field(description="Source branch (branch to merge FROM)")],
        base: Annotated[str, Field(description="Target branch (branch to merge INTO)")],
        title: Annotated[str, Field(description="Pull request title")],
        body: Annotated[Optional[str], Field(description="Pull request description")] = None,
    ) -> int:
        return await asyncio.to_thread(
            _github.create_pr, head, base, title, body
        )

    @mcp.tool(
        name="github-listPullRequests",
        description="List GitHub pull request numbers by their state (open/closed). For GitHub operations only - retrieves PR information from GitHub.",
        tags={"github-specific", "github-read", "gh-pr-list"},
    )
    async def list_prs(
        state: Annotated[str, Field(description="'open' or 'closed'")] = "open",
    ) -> List[int]:
        return await asyncio.to_thread(_github.query_prs, state)

    @mcp.tool(
        name="github-addPullRequestComment",
        description="Add a comment to a GitHub pull request. For GitHub operations only - comments on GitHub PRs.",
        tags={"github-specific", "github-write", "gh-pr-comment"},
    )
    async def add_pr_comment(
        number: Annotated[int, Field(description="Pull request number")],
        body: Annotated[str, Field(description="Comment content")],
    ) -> str:
        return await asyncio.to_thread(_github.add_pr_comment, number, body)

    @mcp.tool(
        name="github-editPullRequestComment",
        description="Edit an existing GitHub pull request comment. For GitHub operations only - modifies comments on GitHub PRs.",
        tags={"github-specific", "github-write", "gh-pr-comment-edit"},
    )
    async def edit_pr_comment(
        comment_id: Annotated[int, Field(description="ID of comment to edit")],
        body: Annotated[str, Field(description="New comment content")],
    ) -> str:
        return await asyncio.to_thread(_github.edit_pr_comment, comment_id, body)

    @mcp.tool(
        name="github-getPullRequest",
        description="Get details of a specific GitHub pull request by number. For GitHub operations only - retrieves GitHub PR details.",
        tags={"github-specific", "github-read", "gh-pr-details"},
    )
    async def get_pr(
        number: Annotated[int, Field(description="Pull request number")],
    ) -> PRSummary:
        return await asyncio.to_thread(_github.get_pr, number)

    # --------------- HEALTH ---------------
    @mcp.tool(
        name="github-healthCheck",
        description="Check if the GitHub-specific MCP service is running and responsive. For GitHub operations only - service health check.",
        tags={"github-specific", "gh-health", "gh-status"},
    )
    async def health_check() -> str:
        return "GitHub MCP service is up and running."