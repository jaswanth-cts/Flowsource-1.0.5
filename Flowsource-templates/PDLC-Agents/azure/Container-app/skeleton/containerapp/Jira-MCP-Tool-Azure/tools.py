# tools.py
import asyncio
from typing import Annotated, Optional
from pydantic import Field
from fastmcp import FastMCP, Context
from fastmcp.exceptions import ToolError
from client import JiraClient
from exceptions import JiraValidationError

_jira = JiraClient()

def register_tools(mcp: FastMCP):
    @mcp.tool(
            name="jira-createIssue",
            description="Creates a new Jira issue. Use 'epic' as the issue_type to create an Epic. Supports optional priority and epic name.",
            tags={"jira", "write"})
    async def create_issue(
        ctx: Context,
        summary: Annotated[str, Field(description="Short title for the issue")],
        description: Annotated[str, Field(description="Detailed description (optional)")] = "",
        issue_type: Annotated[str, Field(description="Jira issue type (e.g., 'Task', 'Sub-task', 'Story', 'Bug', 'Epic', 'Feature', 'Chore)")] = "story",
        priority: Annotated[Optional[str], Field(description="Priority (e.g., 'Highest', 'High', 'Medium', 'Low', 'Lowest')")] = None,
        epic_name: Annotated[Optional[str], Field(description="Only used for epics")] = None,
    ) -> str:
        try:
            return await asyncio.to_thread(_jira.create_issue, summary, description, priority, issue_type, epic_name)
        except JiraValidationError as e:
            raise ToolError(str(e))

    @mcp.tool(
            name="jira-updateIssue",
            description="Updates summary, description, or priority for an existing Jira issue. Provide at least one field to update.",
            tags={"jira", "write"})
    async def update_issue(
        ctx: Context,
        issue_key: Annotated[str, Field(description="Issue key to update")],
        summary: Annotated[Optional[str], Field(description="title for the issue to update")] = None,
        description: Annotated[Optional[str], Field(description="Detailed description to update")] = None,
        priority: Annotated[Optional[str], Field(description="Priority to update (e.g., 'Highest', 'High', 'Medium', 'Low', 'Lowest')")] = None,
    ) -> str:
        try:
            return await asyncio.to_thread(_jira.update_issue, issue_key, summary, description, priority)
        except JiraValidationError as e:
            raise ToolError(str(e))

    @mcp.tool(
            name="jira-linkIssueToEpic",
            description="Links an existing Jira issue (story or task) to a specified Epic.",
            tags={"jira", "write"})
    async def link_issue_to_epic(
        ctx: Context,
        issue_key: Annotated[str, Field(description="Story/task issue key")],
        epic_key: Annotated[str, Field(description="Epic issue key")],
    ) -> str:
        return await asyncio.to_thread(_jira.link_issue_to_epic, issue_key, epic_key)

    @mcp.tool(
            name="jira-addComment",
            description="Adds a comment to an existing Jira issue.",
            tags={"jira", "write"})
    async def add_comment(
        ctx: Context,
        issue_key: Annotated[str, Field(description="Jira issue key")],
        comment: Annotated[str, Field(description="Text to add as comment")],
    ) -> str:
        return await asyncio.to_thread(_jira.add_comment, issue_key, comment)

    @mcp.tool(
            name="jira-getIssue",
            description="Fetches details of a specific Jira issue by its issue key.",
            tags={"jira", "read"})
    async def get_issue(
        ctx: Context,
        issue_key: Annotated[str, Field(description="Jira issue key")],
    ) -> str:
        return await asyncio.to_thread(_jira.get_issue, issue_key)
    
    @mcp.tool(
            name="jira-searchIssues",
            description="Searches Jira using a JQL query. Returns a list of matching issues with key, summary, and status.",
            tags={"jira", "read"})
    async def search_issues(
        ctx: Context,
        jql: Annotated[str, Field(description="JQL query")],
        max_results: Annotated[int, Field(description="Max results")] = 10,
    ) -> str:
        return await asyncio.to_thread(_jira.search_issues, jql, max_results)

    @mcp.tool(
        name="jira-healthCheck",
        description="""Returns the health status of the Jira MCP service. 
                    Use this to verify that the MCP server is up and responsive."""
    )
    async def health_check() -> str:
        return "Jira MCP service is up and running."

