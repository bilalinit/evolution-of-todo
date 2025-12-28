"""
Integration tests for complete CLI user flows.
"""
import pytest
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'src'))
from io import StringIO
from unittest.mock import patch

from backend.cli import CLIHandler
from backend.services import TaskManager


class TestCLIFlow:
    """Test complete CLI user flows."""

    def setup_method(self):
        """Set up fresh CLI for each test."""
        self.tm = TaskManager()
        self.cli = CLIHandler(self.tm)

    def test_complete_user_flow(self):
        """Test a complete user workflow."""
        # Add tasks
        success, message, _ = self.cli.execute_command("add Buy groceries")
        assert success is True
        assert "ID: 1" in message

        success, message, _ = self.cli.execute_command("add Complete homework")
        assert success is True
        assert "ID: 2" in message

        # List tasks
        success, message, _ = self.cli.execute_command("list")
        assert success is True
        assert "Buy groceries" in message
        assert "Complete homework" in message

        # Toggle first task
        success, message, _ = self.cli.execute_command("toggle 1")
        assert success is True
        assert "marked as completed" in message

        # Update second task
        success, message, _ = self.cli.execute_command("update 2 Finish Python project")
        assert success is True
        assert "updated successfully" in message

        # List again to verify changes
        success, message, _ = self.cli.execute_command("list")
        assert success is True
        assert "✓" in message  # Completed task
        assert "Finish Python project" in message

        # Delete first task
        success, message, _ = self.cli.execute_command("delete 1")
        assert success is True
        assert "deleted successfully" in message

        # Final list
        success, message, _ = self.cli.execute_command("list")
        assert success is True
        assert "Finish Python project" in message
        assert "Buy groceries" not in message

    def test_error_scenarios(self):
        """Test various error scenarios."""
        # Invalid ID
        success, message, _ = self.cli.execute_command("update 99 Task")
        assert success is False
        assert "not found" in message

        # Invalid command
        success, message, _ = self.cli.execute_command("invalid")
        assert success is False
        assert "Unknown command" in message

        # Empty title
        success, message, _ = self.cli.execute_command("add")
        assert success is False
        assert "Usage: add <task_title>" in message

        # Non-numeric ID
        success, message, _ = self.cli.execute_command("toggle abc")
        assert success is False
        assert "must be a valid integer" in message

    def test_edge_cases(self):
        """Test edge case scenarios."""
        # Empty input
        success, message, should_exit = self.cli.execute_command("")
        assert success is True
        assert message == ""
        assert should_exit is False

        # Whitespace only
        success, message, should_exit = self.cli.execute_command("   ")
        assert success is True
        assert message == ""
        assert should_exit is False

        # Command with extra spaces (should be normalized to single spaces)
        success, message, _ = self.cli.execute_command("add    Task with    spaces   ")
        assert success is True
        # Verify the task was added by checking the task list
        success, message, _ = self.cli.execute_command("list")
        assert "Task with spaces" in message

        # Long task title
        long_title = "A" * 200
        success, message, _ = self.cli.execute_command(f"add {long_title}")
        assert success is True

    def test_help_and_exit(self):
        """Test help and exit commands."""
        # Help
        success, message, should_exit = self.cli.execute_command("help")
        assert success is True
        assert "Available Commands:" in message
        assert should_exit is False

        # Help aliases
        for alias in ["h", "?"]:
            success, message, should_exit = self.cli.execute_command(alias)
            assert success is True
            assert "Available Commands:" in message
            assert should_exit is False

        # Exit aliases
        for alias in ["exit", "quit", "q", "bye"]:
            success, message, should_exit = self.cli.execute_command(alias)
            assert success is True
            assert "Goodbye" in message
            assert should_exit is True

    def test_command_suggestions(self):
        """Test command suggestion feature."""
        # Typo with suggestion
        success, message, _ = self.cli.execute_command("ad")
        assert success is False
        assert "Did you mean 'add'?" in message

        # Typo without close suggestion
        success, message, _ = self.cli.execute_command("xyz")
        assert success is False
        assert "Unknown command 'xyz'" in message
        assert "Did you mean" not in message

    def test_rapid_invalid_commands(self):
        """Test rapid consecutive invalid commands."""
        invalid_commands = [
            "add",           # No args
            "update",        # No args
            "toggle abc",    # Invalid ID
            "delete 99",     # Not found
            "unknown",       # Unknown command
            "",              # Empty
            "   ",           # Whitespace
        ]

        for cmd in invalid_commands:
            success, message, should_exit = self.cli.execute_command(cmd)
            assert should_exit is False  # Should never crash
            # Should either succeed or fail gracefully
            assert isinstance(success, bool)
            assert isinstance(message, str)

    def test_task_not_found_scenario(self):
        """Test task not found when no tasks exist."""
        # Try operations on non-existent task
        operations = [
            "update 99 Task",
            "delete 99",
            "toggle 99",
        ]

        for op in operations:
            success, message, _ = self.cli.execute_command(op)
            assert success is False
            assert "not found" in message

    def test_concurrent_operations(self):
        """Test multiple operations in sequence."""
        # Add multiple tasks
        for i in range(5):
            success, _, _ = self.cli.execute_command(f"add Task {i+1}")
            assert success is True

        # Verify count
        success, message, _ = self.cli.execute_command("list")
        assert success is True
        assert message.count("\n") >= 2  # Header + separator + 5 tasks

        # Toggle some tasks
        self.cli.execute_command("toggle 1")
        self.cli.execute_command("toggle 3")
        self.cli.execute_command("toggle 5")

        # Delete some tasks
        self.cli.execute_command("delete 2")
        self.cli.execute_command("delete 4")

        # Final state should have 3 tasks: 1 (completed), 3 (completed), 5 (completed)
        success, message, _ = self.cli.execute_command("list")
        assert success is True
        assert "✓" in message  # All completed
        assert message.count("✓") == 3