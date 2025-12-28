"""
Unit tests for utility functions.
"""
import pytest
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'src'))
from datetime import datetime

from backend.utils import (
    validate_title, validate_task_id, format_table,
    format_success, format_error, format_info
)
from backend.models import TaskDisplay


class TestValidateTitle:
    """Test validate_title function."""

    def test_valid_title(self):
        """Test valid title."""
        result = validate_title("Valid Task")
        assert result == "Valid Task"

    def test_title_stripping(self):
        """Test title is stripped."""
        result = validate_title("  Task with spaces  ")
        assert result == "Task with spaces"

    def test_empty_title_raises_error(self):
        """Test empty title raises ValueError."""
        with pytest.raises(ValueError, match="cannot be empty"):
            validate_title("")

    def test_whitespace_only_raises_error(self):
        """Test whitespace-only title raises ValueError."""
        with pytest.raises(ValueError, match="cannot be empty"):
            validate_title("   ")

    def test_long_title_raises_error(self):
        """Test very long title raises ValueError."""
        long_title = "A" * 501
        with pytest.raises(ValueError, match="cannot exceed 500 characters"):
            validate_title(long_title)

    def test_max_length_title(self):
        """Test title at maximum length."""
        max_title = "A" * 500
        result = validate_title(max_title)
        assert result == max_title


class TestValidateTaskID:
    """Test validate_task_id function."""

    def test_valid_positive_integer(self):
        """Test valid positive integer."""
        result = validate_task_id("1")
        assert result == 1

        result = validate_task_id("99")
        assert result == 99

    def test_zero_raises_error(self):
        """Test zero raises ValueError."""
        with pytest.raises(ValueError, match="must be a positive integer"):
            validate_task_id("0")

    def test_negative_raises_error(self):
        """Test negative number raises ValueError."""
        with pytest.raises(ValueError, match="must be a positive integer"):
            validate_task_id("-1")

    def test_non_numeric_raises_error(self):
        """Test non-numeric string raises ValueError."""
        with pytest.raises(ValueError, match="must be a valid integer"):
            validate_task_id("abc")

    def test_float_raises_error(self):
        """Test float string raises ValueError."""
        with pytest.raises(ValueError, match="must be a valid integer"):
            validate_task_id("1.5")


class TestFormatTable:
    """Test format_table function."""

    def test_empty_list(self):
        """Test formatting empty list."""
        result = format_table([])
        assert result == "No tasks found."

    def test_single_task(self):
        """Test formatting single task."""
        task = TaskDisplay(
            id=1,
            title="Test Task",
            completed=False,
            created_at=datetime(2025, 12, 28, 10, 30, 0)
        )
        result = format_table([task])
        assert "ID" in result
        assert "Status" in result
        assert "Title" in result
        assert "Created" in result
        assert "1" in result
        assert "Test Task" in result
        assert "✗" in result  # Not completed

    def test_multiple_tasks(self):
        """Test formatting multiple tasks."""
        tasks = [
            TaskDisplay(1, "Task 1", False, datetime(2025, 12, 28, 10, 0, 0)),
            TaskDisplay(2, "Task 2", True, datetime(2025, 12, 28, 11, 0, 0)),
        ]
        result = format_table(tasks)
        assert "Task 1" in result
        assert "Task 2" in result
        assert "✗" in result  # Task 1 not completed
        assert "✓" in result  # Task 2 completed

    def test_completed_status_symbol(self):
        """Test completed vs not completed symbols."""
        pending = TaskDisplay(1, "Pending", False, datetime.now())
        completed = TaskDisplay(2, "Completed", True, datetime.now())

        result = format_table([pending, completed])
        lines = result.split('\n')

        # Find the rows (skip header and separator)
        pending_line = [line for line in lines if "Pending" in line][0]
        completed_line = [line for line in lines if "Completed" in line][0]

        assert "✗" in pending_line
        assert "✓" in completed_line


class TestFormatMessages:
    """Test message formatting functions."""

    def test_format_success(self):
        """Test success message formatting."""
        result = format_success("Task added")
        assert result == "✓ Task added"

    def test_format_error(self):
        """Test error message formatting."""
        result = format_error("Task not found")
        assert result == "✗ Task not found"

    def test_format_info(self):
        """Test info message formatting."""
        result = format_info("Some info")
        assert result == "ℹ Some info"