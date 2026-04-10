# client.py
import logging
from typing import Dict, List, Optional

# Error messages
COMMENT_BODY_EMPTY_MSG = "Comment body cannot be empty."

from github import (
    Github,
    GithubException,
    InputGitTreeElement,
)

from config import GitHubConfig
from exceptions import GitHubValidationError
from models import FileResponse, PRSummary, PushResponse, IssueSummary

logger = logging.getLogger(__name__)

class GitHubClient:
    """Thin synchronous wrapper around PyGithub for one fixed repository."""

    def __init__(self) -> None:
        self.config = GitHubConfig()
        # PyGithub is blocking; we'll off-load calls with asyncio.to_thread.
        self.client = Github(self.config.token, timeout=15)
        self._repo_cache = None  # lazily initialised

    # ────────────────────────── Low-level helpers ──────────────────────────
    def _repo(self):
        if self._repo_cache is None:
            self._repo_cache = self.client.get_repo(
                f"{self.config.owner}/{self.config.default_repo}"
            )
        return self._repo_cache

    def _ensure_branch(self, repository, branch: str) -> str:
        """Return SHA of branch (create from default if missing)."""
        try:
            return repository.get_branch(branch).commit.sha
        except GithubException as e:
            if e.status == 404:
                sha = repository.get_branch(repository.default_branch).commit.sha
                repository.create_git_ref(ref=f"refs/heads/{branch}", sha=sha)
                return sha
            raise GitHubValidationError(f"Failed to access or create branch '{branch}': {str(e)}")

    # ───────────────────────────── File operations ─────────────────────────
    def create_file(self, path: str, content: str, message: str, branch: str) -> FileResponse:
        try:
            repo = self._repo()
            self._ensure_branch(repo, branch)
            
            # Check if file already exists
            try:
                repo.get_contents(path, ref=branch)
                raise GitHubValidationError(
                    f"File '{path}' already exists on branch '{branch}'. Use github-updateFile instead."
                )
            except GithubException as e:
                if e.status != 404:
                    raise GitHubValidationError(f"Error checking file existence: {str(e)}")
            
            # Create the file
            repo.create_file(path, message, content, branch=branch)
            return FileResponse(
                message="File created successfully",
                repository=repo.full_name,
                path=path,
                branch=branch,
            )
        except GithubException as e:
            raise GitHubValidationError(f"Failed to create file '{path}': {str(e)}")

    def update_file(self, path: str, content: str, message: str, branch: str) -> FileResponse:
        try:
            repo = self._repo()
            self._ensure_branch(repo, branch)
            
            # Get existing file
            try:
                file = repo.get_contents(path, ref=branch)
                if isinstance(file, list):
                    raise GitHubValidationError(f"Path '{path}' refers to a directory, not a file.")
            except GithubException as e:
                if e.status == 404:
                    raise GitHubValidationError(f"File '{path}' not found on branch '{branch}'. Use github-createFile instead.")
                raise GitHubValidationError(f"Error accessing file: {str(e)}")
            
            # Update the file
            repo.update_file(path, message, content, file.sha, branch=branch)
            return FileResponse(
                message="File updated successfully",
                repository=repo.full_name,
                path=path,
                branch=branch,
            )
        except GithubException as e:
            raise GitHubValidationError(f"Failed to update file '{path}': {str(e)}")

    def push_files(
        self, files: Dict[str, str], message: str, branch: str
    ) -> PushResponse:
        try:
            if not files:
                raise GitHubValidationError("No files provided to push.")
            
            # Validate file contents
            for path, content in files.items():
                if not path or not path.strip():
                    raise GitHubValidationError("File path cannot be empty.")
                if content is None:
                    raise GitHubValidationError(f"Content for file '{path}' cannot be None.")
            
            repo = self._repo()

            # 1. Create or get branch ref
            try:
                ref = repo.get_git_ref(f"heads/{branch}")
                base_sha = ref.object.sha
            except GithubException as e:
                if e.status == 404:
                    base_sha = repo.get_branch(repo.default_branch).commit.sha
                    ref = repo.create_git_ref(ref=f"refs/heads/{branch}", sha=base_sha)
                else:
                    raise GitHubValidationError(f"Failed to access branch '{branch}': {str(e)}")

            base_tree = repo.get_git_tree(sha=base_sha)

            # 2. Create tree elements
            elements: List[InputGitTreeElement] = []
            for path, content in files.items():
                try:
                    blob = repo.create_git_blob(content, "utf-8")
                    elements.append(
                        InputGitTreeElement(
                            path=path, mode="100644", type="blob", sha=blob.sha
                        )
                    )
                except Exception as e:
                    raise GitHubValidationError(f"Failed to create blob for '{path}': {str(e)}")

            # 3. Create tree, commit, and update ref
            tree = repo.create_git_tree(elements, base_tree)
            parent = repo.get_git_commit(base_sha)
            commit = repo.create_git_commit(message, tree, [parent])
            ref.edit(commit.sha)

            return PushResponse(
                message="Files pushed successfully",
                repository=repo.full_name,
                branch=branch,
                commit_sha=commit.sha,
                files=list(files.keys())
            )
        except GithubException as e:
            raise GitHubValidationError(f"Failed to push files to branch '{branch}': {str(e)}")

    def get_file_contents(self, path: str, branch: str) -> str:
        try:
            repo = self._repo()
            file = repo.get_contents(path, ref=branch)
            if isinstance(file, list):
                raise GitHubValidationError(f"Path '{path}' refers to a directory, not a file.")
            return file.decoded_content.decode("utf-8")
        except GithubException as e:
            if e.status == 404:
                raise GitHubValidationError(f"File '{path}' not found on branch '{branch}'.")
            raise GitHubValidationError(f"Failed to get file contents: {str(e)}")

    def list_branches(self) -> List[str]:
        try:
            return [b.name for b in self._repo().get_branches()]
        except GithubException as e:
            raise GitHubValidationError(f"Failed to list branches: {str(e)}")

    # ───────────────────────────── Issues API ───────────────────────────────
    def list_open_issues(self) -> List[int]:
        try:
            return [i.number for i in self._repo().get_issues(state="open")]
        except GithubException as e:
            raise GitHubValidationError(f"Failed to list open issues: {str(e)}")

    def create_issue(self, title: str, body: Optional[str] = None) -> int:
        try:
            if not title or not title.strip():
                raise GitHubValidationError("Issue title cannot be empty.")
            return self._repo().create_issue(title=title, body=body or "").number
        except GithubException as e:
            raise GitHubValidationError(f"Failed to create issue: {str(e)}")

    def get_issue(self, number: int) -> IssueSummary:
        try:
            i = self._repo().get_issue(number)
            return IssueSummary(
                number=i.number,
                title=i.title,
                state=i.state,
                url=i.html_url,
            )
        except GithubException as e:
            if e.status == 404:
                raise GitHubValidationError(f"Issue #{number} not found.")
            raise GitHubValidationError(f"Failed to get issue #{number}: {str(e)}")

    def add_issue_comment(self, number: int, body: str) -> str:
        try:
            if not body or not body.strip():
                raise GitHubValidationError(COMMENT_BODY_EMPTY_MSG)
            self._repo().get_issue(number).create_comment(body)
            return "Comment added successfully."
        except GithubException as e:
            if e.status == 404:
                raise GitHubValidationError(f"Issue #{number} not found.")
            raise GitHubValidationError(f"Failed to add comment to issue #{number}: {str(e)}")

    # ───────────────────────── Pull-request API ────────────────────────────
    def create_pr(
        self, head: str, base: str, title: str, body: Optional[str] = None
    ) -> int:
        try:
            if not title or not title.strip():
                raise GitHubValidationError("Pull request title cannot be empty.")
            if not head or not base:
                raise GitHubValidationError("Both head and base branches must be specified.")
            
            return (
                self._repo()
                .create_pull(title=title, body=body or "", head=head, base=base)
                .number
            )
        except GithubException as e:
            raise GitHubValidationError(f"Failed to create pull request: {str(e)}")

    def query_prs(self, state: str = "open") -> List[int]:
        try:
            if state not in ["open", "closed", "all"]:
                raise GitHubValidationError("State must be 'open', 'closed', or 'all'.")
            return [p.number for p in self._repo().get_pulls(state=state)]
        except GithubException as e:
            raise GitHubValidationError(f"Failed to list pull requests: {str(e)}")

    def add_pr_comment(self, number: int, body: str) -> str:
        try:
            if not body or not body.strip():
                raise GitHubValidationError(COMMENT_BODY_EMPTY_MSG)
            self._repo().get_pull(number).create_issue_comment(body)
            return "Comment added successfully."
        except GithubException as e:
            if e.status == 404:
                raise GitHubValidationError(f"Pull request #{number} not found.")
            raise GitHubValidationError(f"Failed to add comment to PR #{number}: {str(e)}")

    def edit_pr_comment(self, comment_id: int, body: str) -> str:
        try:
            if not body or not body.strip():
                raise GitHubValidationError(COMMENT_BODY_EMPTY_MSG)
            self._repo().get_comment(comment_id).edit(body)
            return "Comment edited successfully."
        except GithubException as e:
            if e.status == 404:
                raise GitHubValidationError(f"Comment #{comment_id} not found.")
            raise GitHubValidationError(f"Failed to edit comment #{comment_id}: {str(e)}")
 
    def get_pr(self, number: int) -> PRSummary:
        try:
            i = self._repo().get_pull(number)
            return PRSummary(
                number=i.number,
                title=i.title,
                state=i.state,
                url=i.html_url,
            )
        except GithubException as e:
            if e.status == 404:
                raise GitHubValidationError(f"Pull request #{number} not found.")
            raise GitHubValidationError(f"Failed to get pull request #{number}: {str(e)}")