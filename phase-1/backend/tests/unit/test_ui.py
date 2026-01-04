"""
Unit tests for UI functions.
"""

import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime
from backend.ui import (
    display_header,
    display_main_menu,
    display_help,
    display_exit_message,
    display_message,
    display_pause,
    display_add_form,
    display_list_view,
    display_empty_state,
    display_update_step1,
    display_update_step2,
    display_toggle_confirmation,
    display_delete_confirmation,
    display_confirmation_prompt,
)
from backend.models import Task


class TestDisplayHeader:
    """Test display_header function."""

    @patch('builtins.print')
    def test_display_header(self, mock_print):
        """Test header displays correctly."""
        display_header()
        assert mock_print.called
        output = mock_print.call_args[0][0]
        assert "TODO APPLICATION" in output


class TestDisplayMainMenu:
    """Test display_main_menu function."""

    @patch('builtins.print')
    def test_display_main_menu(self, mock_print):
        """Test main menu displays correctly."""
        display_main_menu()
        assert mock_print.called
        output = mock_print.call_args[0][0]
        assert "MAIN MENU" in output
        assert "Add New Task" in output
        assert "View All Tasks" in output


class TestDisplayHelp:
    """Test display_help function."""

    @patch('builtins.print')
    def test_display_help(self, mock_print):
        """Test help displays correctly."""
        display_help()
        assert mock_print.called
        output = mock_print.call_args[0][0]
        assert "HELP" in output
        assert "Welcome" in output


class TestDisplayExitMessage:
    """Test display_exit_message function."""

    @patch('builtins.print')
    def test_display_exit_message(self, mock_print):
        """Test exit message displays correctly."""
        display_exit_message()
        assert mock_print.called
        output = mock_print.call_args[0][0]
        assert "GOODBYE" in output


class TestDisplayMessage:
    """Test display_message function."""

    @patch('builtins.print')
    def test_display_message_info(self, mock_print):
        """Test info message."""
        display_message("Test message", "info")
        output = mock_print.call_args[0][0]
        assert "Test message" in output
        assert "ℹ" in output

    @patch('builtins.print')
    def test_display_message_success(self, mock_print):
        """Test success message."""
        display_message("Success!", "success")
        output = mock_print.call_args[0][0]
        assert "Success!" in output
        assert "✓" in output

    @patch('builtins.print')
    def test_display_message_error(self, mock_print):
        """Test error message."""
        display_message("Error occurred", "error")
        output = mock_print.call_args[0][0]
        assert "Error occurred" in output
        assert "✗" in output


class TestDisplayPause:
    """Test display_pause function."""

    @patch('builtins.input')
    def test_display_pause(self, mock_input):
        """Test pause waits for input."""
        display_pause()
        assert mock_input.called
        call_text = mock_input.call_args[0][0]
        assert "Press Enter" in call_text


class TestDisplayAddForm:
    """Test display_add_form function."""

    @patch('builtins.input')
    @patch('builtins.print')
    def test_display_add_form_success(self, mock_print, mock_input):
        """Test successful task addition."""
        # Mock user input: enter title, confirm yes
        mock_input.side_effect = ["Test Task", "y"]

        result = display_add_form()

        assert result == "Test Task"
        assert mock_print.called

    @patch('builtins.input')
    @patch('builtins.print')
    def test_display_add_form_cancel(self, mock_print, mock_input):
        """Test task addition cancellation."""
        # Mock user input: empty (cancel)
        mock_input.side_effect = [""]

        result = display_add_form()

        assert result is None

    @patch('builtins.input')
    @patch('builtins.print')
    def test_display_add_form_invalid_then_valid(self, mock_print, mock_input):
        """Test invalid input followed by valid input."""
        # Mock user input: invalid title (too long), pause, then valid title, then confirm
        long_title = "A" * 501
        mock_input.side_effect = [long_title, "", "Valid Task", "y"]

        result = display_add_form()

        assert result == "Valid Task"


class TestDisplayListView:
    """Test display_list_view function."""

    @patch('builtins.print')
    def test_display_list_view_empty(self, mock_print):
        """Test empty task list."""
        display_list_view([])
        assert mock_print.called
        output = mock_print.call_args[0][0]
        assert "NO TASKS" in output

    @patch('builtins.print')
    def test_display_list_view_with_tasks(self, mock_print):
        """Test task list with tasks."""
        tasks = [
            Task(id=1, title="Task 1", completed=False, created_at=datetime(2025, 12, 28, 10, 30)),
            Task(id=2, title="Task 2", completed=True, created_at=datetime(2025, 12, 28, 11, 0)),
        ]

        display_list_view(tasks)
        assert mock_print.called

        # Check all print calls contain expected content
        all_outputs = [str(call[0][0]) for call in mock_print.call_args_list]
        combined_output = " ".join(all_outputs)

        assert "PROGRESS" in combined_output
        assert "TASKS" in combined_output
        assert "Task 1" in combined_output
        assert "Task 2" in combined_output


class TestDisplayEmptyState:
    """Test display_empty_state function."""

    @patch('builtins.print')
    def test_display_empty_state(self, mock_print):
        """Test empty state displays correctly."""
        display_empty_state()
        assert mock_print.called
        output = mock_print.call_args[0][0]
        assert "NO TASKS" in output


class TestDisplayUpdateStep1:
    """Test display_update_step1 function."""

    @patch('builtins.input')
    @patch('builtins.print')
    def test_display_update_step1_success(self, mock_print, mock_input):
        """Test successful task selection."""
        tasks = [
            Task(id=1, title="Task 1", completed=False, created_at=datetime.now()),
            Task(id=2, title="Task 2", completed=False, created_at=datetime.now()),
        ]
        mock_input.return_value = "1"

        result = display_update_step1(tasks)

        assert result == 1

    @patch('builtins.input')
    @patch('builtins.print')
    def test_display_update_step1_cancel(self, mock_print, mock_input):
        """Test task selection cancellation."""
        tasks = [
            Task(id=1, title="Task 1", completed=False, created_at=datetime.now()),
        ]
        mock_input.return_value = "0"

        result = display_update_step1(tasks)

        assert result is None

    @patch('builtins.input')
    @patch('builtins.print')
    def test_display_update_step1_no_tasks(self, mock_print, mock_input):
        """Test with no tasks available."""
        result = display_update_step1([])
        assert result is None


class TestDisplayUpdateStep2:
    """Test display_update_step2 function."""

    @patch('builtins.input')
    @patch('builtins.print')
    def test_display_update_step2_success(self, mock_print, mock_input):
        """Test successful title update."""
        task = Task(id=1, title="Old Title", completed=False, created_at=datetime.now())
        mock_input.side_effect = ["New Title", "y"]

        result = display_update_step2(task)

        assert result == "New Title"

    @patch('builtins.input')
    @patch('builtins.print')
    def test_display_update_step2_cancel(self, mock_print, mock_input):
        """Test update cancellation."""
        task = Task(id=1, title="Old Title", completed=False, created_at=datetime.now())
        mock_input.return_value = ""

        result = display_update_step2(task)

        assert result is None


class TestDisplayToggleConfirmation:
    """Test display_toggle_confirmation function."""

    @patch('builtins.input')
    @patch('builtins.print')
    def test_display_toggle_confirmation_yes(self, mock_print, mock_input):
        """Test confirming toggle."""
        task = Task(id=1, title="Test Task", completed=False, created_at=datetime.now())
        mock_input.return_value = "yes"

        result = display_toggle_confirmation(task)

        assert result is True

    @patch('builtins.input')
    @patch('builtins.print')
    def test_display_toggle_confirmation_no(self, mock_print, mock_input):
        """Test cancelling toggle."""
        task = Task(id=1, title="Test Task", completed=False, created_at=datetime.now())
        mock_input.return_value = "no"

        result = display_toggle_confirmation(task)

        assert result is False


class TestDisplayDeleteConfirmation:
    """Test display_delete_confirmation function."""

    @patch('builtins.input')
    @patch('builtins.print')
    def test_display_delete_confirmation_yes(self, mock_print, mock_input):
        """Test confirming deletion."""
        task = Task(id=1, title="Test Task", completed=False, created_at=datetime.now())
        mock_input.return_value = "DELETE"

        result = display_delete_confirmation(task)

        assert result is True

    @patch('builtins.input')
    @patch('builtins.print')
    def test_display_delete_confirmation_no(self, mock_print, mock_input):
        """Test cancelling deletion."""
        task = Task(id=1, title="Test Task", completed=False, created_at=datetime.now())
        mock_input.return_value = "cancel"

        result = display_delete_confirmation(task)

        assert result is False


class TestDisplayConfirmationPrompt:
    """Test display_confirmation_prompt function."""

    @patch('builtins.input')
    @patch('builtins.print')
    def test_display_confirmation_prompt_yes(self, mock_print, mock_input):
        """Test confirming with yes."""
        mock_input.return_value = "y"

        result = display_confirmation_prompt("Are you sure?")

        assert result is True

    @patch('builtins.input')
    @patch('builtins.print')
    def test_display_confirmation_prompt_no(self, mock_print, mock_input):
        """Test denying with no."""
        mock_input.return_value = "n"

        result = display_confirmation_prompt("Are you sure?")

        assert result is False