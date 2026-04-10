class ResourceNotFoundException(Exception):
    """Exception raised when a resource is not found."""

    def __init__(self, message, cause=None):
        super().__init__(message)
        if cause:
            self.__cause__ = cause

    @classmethod
    def from_invalid_id(cls, invalid_id):
        return cls(f"Resource with id {invalid_id} not found")
