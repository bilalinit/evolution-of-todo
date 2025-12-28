"""
Unit tests for CLI command parsing and handling.
"""
import pytest
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'src'))

from backend.cli import CLIHandler
from backend.services import TaskManager


class TestCLIHandler:
    """Test CLIHandler class."""

    def setup_method(self):
        """Set up fresh CLIHandler for each test."""
        self.tm = TaskManager()
        self.cli = CLIHandler(self.tm)

    def test_parse_command(self):
        """Test command parsing."""
        command, args = self.cli.parse_command("add Buy groceries")
        assert command == "add"
        assert args == ["Buy", "groceries"]

    def test_parse_command_no_args(self):
        """Test parsing command without arguments."""
        command, args = self.cli.parse_command("list")
        assert command == "list"
        assert args == []

    def test_parse_command_empty_input(self):
        """Test parsing empty input."""
        command, args = self.cli.parse_command("")
        assert command == ""
        assert args == []

    def test_parse_command_whitespace(self):
        """Test parsing whitespace input."""
        command, args = self.cli.parse_command("   ")
        assert command == ""
        assert args == []

    def test_parse_command_quotes(self):
        """Test parsing quoted arguments."""
        command, args = self.cli.parse_command('add "Buy groceries"')
        assert command == "add"
        assert args == ['"Buy', 'groceries"']

    def test_handle_add_success(self):
        """Test add command handler."""
        success, message, should_exit = self.cli.handle_add(["Test", "Task"])
        assert success is True
        assert "added successfully" in message
        assert should_exit is False

    def test_handle_add_no_args(self):
        """Test add command with no arguments."""
        success, message, should_exit = self.cli.handle_add([])
        assert success is False
        assert "Usage: add <task_title>" in message
        assert should_exit is False

    def test_handle_list_empty(self):
        """Test list command with no tasks."""
        success, message, should_exit = self.cli.handle_list([])
        assert success is True
        assert "No tasks found" in message
        assert should_exit is False

    def test_handle_list_with_tasks(self):
        """Test list command with tasks."""
        self.tm.add_task("Task 1")
        success, message, should_exit = self.cli.handle_list([])
        assert success is True
        assert "Task 1" in message
        assert should_exit is False

    def test_handle_update_success(self):
        """Test update command handler."""
        self.tm.add_task("Original")
        success, message, should_exit = self.cli.handle_update(["1", "Updated"])
        assert success is True
        assert "updated successfully" in message
        assert should_exit is False

    def test_handle_update_no_args(self):
        """Test update command with no arguments."""
        success, message, should_exit = self.cli.handle_update([])
        assert success is False
        assert "Usage: update <task_id> <new_title>" in message
        assert should_exit is False

    def test_handle_update_invalid_id(self):
        """Test update command with invalid ID."""
        success, message, should_exit = self.cli.handle_update(["abc", "Title"])
        assert success is False
        assert "must be a valid integer" in message
        assert should_exit is False

    def test_handle_delete_success(self):
        """Test delete command handler."""
        self.tm.add_task("Task 1")
        success, message, should_exit = self.cli.handle_delete(["1"])
        assert success is True
        assert "deleted successfully" in message
        assert should_exit is False

    def test_handle_delete_no_args(self):
        """Test delete command with no arguments."""
        success, message, should_exit = self.cli.handle_delete([])
        assert success is False
        assert "Usage: delete <task_id>" in message
        assert should_exit is False

    def test_handle_toggle_success(self):
        """Test toggle command handler."""
        self.tm.add_task("Task 1")
        success, message, should_exit = self.cli.handle_toggle(["1"])
        assert success is True
        assert "marked as completed" in message
        assert should_exit is False

    def test_handle_toggle_no_args(self):
        """Test toggle command with no arguments."""
        success, message, should_exit = self.cli.handle_toggle([])
        assert success is False
        assert "Usage: toggle <task_id>" in message
        assert should_exit is False

    def test_handle_help(self):
        """Test help command handler."""
        success, message, should_exit = self.cli.handle_help([])
        assert success is True
        assert "Available Commands:" in message
        assert should_exit is False

    def test_handle_exit(self):
        """Test exit command handler."""
        success, message, should_exit = self.cli.handle_exit([])
        assert success is True
        assert "Goodbye" in message
        assert should_exit is True

    def test_execute_command_unknown(self):
        """Test executing unknown command."""
        success, message, should_exit = self.cli.execute_command("unknown")
        assert success is False
        assert "Unknown command" in message
        assert should_exit is False

    def test_execute_command_suggestion(self):
        """Test command suggestion for typos."""
        success, message, should_exit = self.cli.execute_command("ad")
        assert success is False
        assert "Did you mean 'add'?" in message
        assert should_exit is False

    def test_execute_command_empty(self):
        """Test executing empty command."""
        success, message, should_exit = self.cli.execute_command("")
        assert success is True
        assert message == ""
        assert should_exit is False

    def test_execute_command_add(self):
        """Test executing add command."""
        success, message, should_exit = self.cli.execute_command("add Test Task")
        assert success is True
        assert "added successfully" in message
        assert should_exit is False

    def test_get_suggestion(self):
        """Test suggestion algorithm."""
        suggestion = self.cli._get_suggestion("ad")
        assert suggestion == "add"

        suggestion = self.cli._get_suggestion("li")
        assert suggestion == "list"

        suggestion = self.cli._get_suggestion("xyz")
        assert suggestion is None

    def test_all_command_aliases(self):
        """Test all command aliases work."""
        aliases_to_test = [
            ("a", "add"),
            ("new", "add"),
            ("create", "add"),
            ("l", "list"),
            ("ls", "list"),
            ("show", "list"),
            ("view", "list"),
            ("u", "update"),
            ("edit", "update"),
            ("d", "delete"),
            ("remove", "delete"),
            ("t", "toggle"),
            ("complete", "toggle"),
            ("h", "help"),
            ("?", "help"),
            ("quit", "exit"),
            ("q", "exit"),
            ("bye", "exit"),
        ]

        for alias, expected_handler in aliases_to_test:
            handler = self.cli.commands.get(alias)
            assert handler is not None, f"Alias {alias} not found"
            expected_func = getattr(self.cli, f"handle_{expected_handler}")
            assert handler == expected_func, f"Alias {alias} doesn't map to {expected_handler}"

    def test_update_with_multiple_args(self):
        """Test update command with multiple words in title."""
        self.tm.add_task("Original")
        success, message, should_exit = self.cli.handle_update(["1", "New", "Updated", "Title"])
        assert success is True
        task = self.tm.tasks[0]
        assert task.title == "New Updated Title"

    def test_execute_command_with_quotes(self):
        """Test command execution with quoted arguments."""
        success, message, should_exit = self.cli.execute_command('add "Task with spaces"')
        assert success is True
        assert "added successfully" in message

    def test_handle_list_with_tasks(self):
        """Test list command with actual tasks."""
        self.tm.add_task("Task 1")
        self.tm.add_task("Task 2")
        success, message, should_exit = self.cli.handle_list([])
        assert success is True
        assert "Task 1" in message
        assert "Task 2" in message