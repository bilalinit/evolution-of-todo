"""
Unit tests for new utility functions added for menu-driven UI.
"""

import pytest
from datetime import datetime
from backend.utils import (
    create_box,
    create_separator,
    wrap_text,
    sanitize_input,
    validate_menu_choice,
    validate_task_title_for_menu,
    format_task_row,
    get_progress_stats,
    validate_task_id_for_menu,
    COLOR_HEADER,
    BOX_CHARS,
)
from backend.models import Task


class TestCreateBox:
    """Test create_box function."""

    def test_create_box_basic(self):
        """Test basic box creation."""
        content = ["Line 1", "Line 2"]
        box = create_box("Test", content, width=30)

        assert BOX_CHARS["top_left"] in box
        assert BOX_CHARS["bottom_right"] in box
        assert "Line 1" in box
        assert "Line 2" in box

    def test_create_box_with_long_content(self):
        """Test box with content that needs wrapping."""
        content = ["This is a very long line that should be wrapped"]
        box = create_box("Title", content, width=20)

        # Should contain wrapped lines
        assert len(box.split('\n')) > 3  # More than just top, content, bottom

    def test_create_box_empty_title(self):
        """Test box with empty title."""
        content = ["Test"]
        box = create_box("", content, width=30)

        assert BOX_CHARS["top_left"] in box
        assert BOX_CHARS["bottom_left"] in box


class TestCreateSeparator:
    """Test create_separator function."""

    def test_create_separator_default(self):
        """Test separator with default width."""
        sep = create_separator()
        assert len(sep) == 50
        assert all(c == BOX_CHARS["horizontal"] for c in sep)

    def test_create_separator_custom_width(self):
        """Test separator with custom width."""
        sep = create_separator(30)
        assert len(sep) == 30
        assert sep == BOX_CHARS["horizontal"] * 30


class TestWrapText:
    """Test wrap_text function."""

    def test_wrap_text_short(self):
        """Test wrapping short text."""
        result = wrap_text("Hello World", 20)
        assert result == ["Hello World"]

    def test_wrap_text_long(self):
        """Test wrapping long text."""
        text = "This is a very long sentence that needs to be wrapped"
        result = wrap_text(text, 15)

        assert len(result) > 1
        assert all(len(line) <= 15 for line in result)

    def test_wrap_text_empty(self):
        """Test wrapping empty text."""
        result = wrap_text("", 10)
        assert result == [""]

    def test_wrap_text_zero_width(self):
        """Test wrapping with zero width."""
        result = wrap_text("Hello", 0)
        assert result == ["Hello"]


class TestSanitizeInput:
    """Test sanitize_input function."""

    def test_sanitize_input_normal(self):
        """Test normal input."""
        result = sanitize_input("Hello World")
        assert result == "Hello World"

    def test_sanitize_input_whitespace(self):
        """Test input with extra whitespace."""
        result = sanitize_input("  Hello   World  ")
        assert result == "Hello World"

    def test_sanitize_input_empty(self):
        """Test empty input."""
        result = sanitize_input("")
        assert result == ""

    def test_sanitize_input_control_chars(self):
        """Test input with control characters."""
        result = sanitize_input("Hello\x00World\t\nTest")
        assert "Hello" in result
        assert "World" in result
        assert "Test" in result


class TestValidateMenuChoice:
    """Test validate_menu_choice function."""

    def test_validate_menu_choice_valid(self):
        """Test valid menu choice."""
        is_valid, msg = validate_menu_choice("3", 7)
        assert is_valid is True
        assert msg == ""

    def test_validate_menu_choice_empty(self):
        """Test empty input."""
        is_valid, msg = validate_menu_choice("", 7)
        assert is_valid is False
        assert "enter a choice" in msg.lower()

    def test_validate_menu_choice_non_numeric(self):
        """Test non-numeric input."""
        is_valid, msg = validate_menu_choice("abc", 7)
        assert is_valid is False
        assert "valid number" in msg.lower()

    def test_validate_menu_choice_out_of_range(self):
        """Test out of range input."""
        is_valid, msg = validate_menu_choice("10", 7)
        assert is_valid is False
        assert "between 1-7" in msg


class TestValidateTitle:
    """Test validate_task_title_for_menu function."""

    def test_validate_title_valid(self):
        """Test valid title."""
        is_valid, msg = validate_task_title_for_menu("Buy groceries")
        assert is_valid is True
        assert msg == ""

    def test_validate_title_empty(self):
        """Test empty title."""
        is_valid, msg = validate_task_title_for_menu("")
        assert is_valid is False
        assert "cannot be empty" in msg

    def test_validate_title_whitespace(self):
        """Test whitespace-only title."""
        is_valid, msg = validate_task_title_for_menu("   ")
        assert is_valid is False
        assert "whitespace-only" in msg

    def test_validate_title_too_long(self):
        """Test title that's too long."""
        long_title = "A" * 501
        is_valid, msg = validate_task_title_for_menu(long_title)
        assert is_valid is False
        assert "500 characters" in msg


class TestFormatTaskRow:
    """Test format_task_row function."""

    def test_format_task_row_pending(self):
        """Test formatting pending task."""
        task = Task(id=1, title="Test Task", completed=False, created_at=datetime(2025, 12, 28, 10, 30))
        result = format_task_row(task)

        assert "[1]" in result
        assert "☐" in result
        assert "Test Task" in result
        assert "2025-12-28" in result

    def test_format_task_row_completed(self):
        """Test formatting completed task."""
        task = Task(id=2, title="Done Task", completed=True, created_at=datetime(2025, 12, 28, 11, 0))
        result = format_task_row(task)

        assert "[2]" in result
        assert "☑" in result
        assert "Done Task" in result


class TestGetProgressStats:
    """Test get_progress_stats function."""

    def test_get_progress_stats_empty(self):
        """Test with empty task list."""
        result = get_progress_stats([])
        assert "No tasks" in result

    def test_get_progress_stats_all_pending(self):
        """Test with all pending tasks."""
        tasks = [
            Task(id=1, title="Task 1", completed=False, created_at=datetime.now()),
            Task(id=2, title="Task 2", completed=False, created_at=datetime.now()),
        ]
        result = get_progress_stats(tasks)
        assert "Completed: 0" in result
        assert "Pending: 2" in result
        assert "0.0% Done" in result

    def test_get_progress_stats_mixed(self):
        """Test with mixed completed/pending tasks."""
        tasks = [
            Task(id=1, title="Task 1", completed=True, created_at=datetime.now()),
            Task(id=2, title="Task 2", completed=False, created_at=datetime.now()),
            Task(id=3, title="Task 3", completed=True, created_at=datetime.now()),
        ]
        result = get_progress_stats(tasks)
        assert "Completed: 2" in result
        assert "Pending: 1" in result
        assert "66.7% Done" in result


class TestValidateTaskIdForMenu:
    """Test validate_task_id_for_menu function."""

    def test_validate_task_id_valid(self):
        """Test valid task ID."""
        is_valid, msg = validate_task_id_for_menu("5")
        assert is_valid is True
        assert msg == ""

    def test_validate_task_id_empty(self):
        """Test empty input."""
        is_valid, msg = validate_task_id_for_menu("")
        assert is_valid is False
        assert "enter" in msg.lower() and "task id" in msg.lower()

    def test_validate_task_id_non_numeric(self):
        """Test non-numeric input."""
        is_valid, msg = validate_task_id_for_menu("abc")
        assert is_valid is False
        assert "valid integer" in msg.lower()

    def test_validate_task_id_zero(self):
        """Test zero task ID."""
        is_valid, msg = validate_task_id_for_menu("0")
        assert is_valid is False
        assert "positive" in msg.lower()

    def test_validate_task_id_negative(self):
        """Test negative task ID."""
        is_valid, msg = validate_task_id_for_menu("-1")
        assert is_valid is False
        assert "positive" in msg.lower()