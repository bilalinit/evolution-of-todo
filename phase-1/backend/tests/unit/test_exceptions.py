"""
Unit tests for exception hierarchy.
"""
import pytest
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'src'))

from backend.exceptions import (
    TodoAppException, ValidationError, TaskNotFoundError,
    InvalidIDError, EmptyTitleError, UnknownCommandError
)


class TestExceptionHierarchy:
    """Test exception inheritance and usage."""

    def test_todo_app_exception_hierarchy(self):
        """Test that all exceptions inherit from TodoAppException."""
        exceptions = [
            ValidationError,
            TaskNotFoundError,
            InvalidIDError,
            EmptyTitleError,
            UnknownCommandError,
        ]

        for exc in exceptions:
            assert issubclass(exc, TodoAppException)
            assert issubclass(exc, Exception)

    def test_exception_messages(self):
        """Test exception messages."""
        with pytest.raises(ValidationError, match="Test error"):
            raise ValidationError("Test error")

        with pytest.raises(TaskNotFoundError, match="Task not found"):
            raise TaskNotFoundError("Task not found")

        with pytest.raises(UnknownCommandError, match="Unknown command"):
            raise UnknownCommandError("Unknown command")

    def test_exception_can_be_caught(self):
        """Test that exceptions can be caught by base class."""
        try:
            raise ValidationError("Test")
        except TodoAppException:
            pass  # Success
        else:
            pytest.fail("Should have caught TodoAppException")

    def test_exception_inheritance_specific(self):
        """Test specific exception catching."""
        with pytest.raises(ValidationError):
            raise ValidationError("Test")

        with pytest.raises(TaskNotFoundError):
            raise TaskNotFoundError("Test")