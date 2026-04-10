# exceptions.py
class GitHubValidationError(Exception):
    """Raised when a bad input is passed to the GitHub client."""
    pass