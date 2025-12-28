"""
CLI command parsing and interface for the Todo Application.

Handles command routing, argument parsing, and display formatting.
"""

from typing import Dict, List, Optional, Tuple, Callable

from .services import TaskManager
from .utils import format_table, format_success, format_error, format_info


class CLIHandler:
    """
    CLI command handler and router.
    """

    def __init__(self, task_manager: TaskManager) -> None:
        """Initialize CLI handler with a task manager.

        Args:
            task_manager: TaskManager instance for handling operations
        """
        self.task_manager = task_manager

        # Command mapping with aliases
        self.commands: Dict[str, Callable[[List[str]], Tuple[bool, str, bool]]] = {
            # Core operations
            "add": self.handle_add,
            "a": self.handle_add,
            "new": self.handle_add,
            "create": self.handle_add,
            "list": self.handle_list,
            "l": self.handle_list,
            "ls": self.handle_list,
            "show": self.handle_list,
            "view": self.handle_list,
            "update": self.handle_update,
            "u": self.handle_update,
            "edit": self.handle_update,
            "delete": self.handle_delete,
            "d": self.handle_delete,
            "remove": self.handle_delete,
            "toggle": self.handle_toggle,
            "t": self.handle_toggle,
            "complete": self.handle_toggle,
            # Help and exit
            "help": self.handle_help,
            "h": self.handle_help,
            "?": self.handle_help,
            "exit": self.handle_exit,
            "quit": self.handle_exit,
            "q": self.handle_exit,
            "bye": self.handle_exit,
        }

    def parse_command(self, user_input: str) -> Tuple[str, List[str]]:
        """
        Parse user input into command and arguments.

        Args:
            user_input: Raw user input string

        Returns:
            Tuple of (command: str, args: List[str])
        """
        if not user_input or not user_input.strip():
            return "", []

        parts = user_input.strip().split()
        command = parts[0].lower()
        args = parts[1:]

        return command, args

    def execute_command(self, user_input: str) -> Tuple[bool, str, bool]:
        """
        Execute a command from user input.

        Args:
            user_input: Raw user input string

        Returns:
            Tuple of (success: bool, message: str, should_exit: bool)
        """
        command, args = self.parse_command(user_input)

        # Handle empty input
        if not command:
            return True, "", False

        # Find command handler
        handler = self.commands.get(command)
        if not handler:
            suggestion = self._get_suggestion(command)
            if suggestion:
                return (
                    False,
                    format_error(
                        f"Unknown command '{command}'. Did you mean '{suggestion}'?"
                    ),
                    False,
                )
            else:
                return (
                    False,
                    format_error(
                        f"Unknown command '{command}'. Type 'help' for available commands."
                    ),
                    False,
                )

        # Execute handler
        try:
            return handler(args)
        except Exception as e:
            return False, format_error(f"Error executing command: {str(e)}"), False

    def handle_add(self, args: List[str]) -> Tuple[bool, str, bool]:
        """Handle add command."""
        if not args:
            return False, format_error("Usage: add <task_title>"), False

        title = " ".join(args)
        success, message, task = self.task_manager.add_task(title)

        if success:
            return True, format_success(message), False
        else:
            return False, format_error(message), False

    def handle_list(self, args: List[str]) -> Tuple[bool, str, bool]:
        """Handle list command."""
        success, message, tasks = self.task_manager.list_tasks()

        if not success:
            return False, format_error(message), False

        if not tasks:
            return True, format_info("No tasks found."), False

        table = format_table(tasks)
        return True, table, False

    def handle_update(self, args: List[str]) -> Tuple[bool, str, bool]:
        """Handle update command."""
        if len(args) < 2:
            return False, format_error("Usage: update <task_id> <new_title>"), False

        try:
            task_id = int(args[0])
            new_title = " ".join(args[1:])

            success, message, task = self.task_manager.update_task(task_id, new_title)

            if success:
                return True, format_success(message), False
            else:
                return False, format_error(message), False

        except ValueError:
            return False, format_error("Task ID must be a valid integer."), False

    def handle_delete(self, args: List[str]) -> Tuple[bool, str, bool]:
        """Handle delete command."""
        if not args:
            return False, format_error("Usage: delete <task_id>"), False

        try:
            task_id = int(args[0])
            success, message, task = self.task_manager.delete_task(task_id)

            if success:
                return True, format_success(message), False
            else:
                return False, format_error(message), False

        except ValueError:
            return False, format_error("Task ID must be a valid integer."), False

    def handle_toggle(self, args: List[str]) -> Tuple[bool, str, bool]:
        """Handle toggle command."""
        if not args:
            return False, format_error("Usage: toggle <task_id>"), False

        try:
            task_id = int(args[0])
            success, message, task = self.task_manager.toggle_task(task_id)

            if success:
                return True, format_success(message), False
            else:
                return False, format_error(message), False

        except ValueError:
            return False, format_error("Task ID must be a valid integer."), False

    def handle_help(self, args: List[str]) -> Tuple[bool, str, bool]:
        """Handle help command."""
        help_text = """
Available Commands:
  add, a, new, create    - Create a new task
  list, l, ls, show, view - List all tasks
  update, u, edit        - Modify a task's title
  delete, d, remove      - Remove a task
  toggle, t, complete    - Mark task complete/incomplete
  help, h, ?             - Show this help menu
  exit, quit, q, bye     - Quit the application

Usage Examples:
  add "Buy groceries"
  list
  update 2 "Finish Python project"
  delete 1
  toggle 3
  help
  exit
"""
        return True, help_text.strip(), False

    def handle_exit(self, args: List[str]) -> Tuple[bool, str, bool]:
        """Handle exit command."""
        return True, "Goodbye! 👋", True

    def _get_suggestion(self, command: str) -> Optional[str]:
        """
        Get a suggestion for a misspelled command.

        Args:
            command: The unknown command

        Returns:
            Suggested command or None
        """
        # Simple suggestion logic - find closest command by prefix
        for cmd in self.commands.keys():
            if cmd.startswith(command[:2]) and len(cmd) <= len(command) + 2:
                return cmd
        return None
