"""
Custom exception hierarchy for the CLI Todo Application.

All exceptions inherit from TodoAppException for easy catching.
"""


class TodoAppException(Exception):
    """Base exception for all Todo Application errors."""

    pass


class ValidationError(TodoAppException):
    """Raised when input validation fails."""

    pass


class TaskNotFoundError(TodoAppException):
    """Raised when a task with the given ID is not found."""

    pass


class InvalidIDError(TodoAppException):
    """Raised when an invalid task ID is provided."""

    pass


class EmptyTitleError(TodoAppException):
    """Raised when a task title is empty or whitespace-only."""

    pass


class UnknownCommandError(TodoAppException):
    """Raised when an unknown command is entered."""

    pass
