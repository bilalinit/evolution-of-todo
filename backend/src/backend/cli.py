"""
Menu-Driven CLI Handler for the Todo Application.

Replaces command-based interface with visual menu system.
"""

from typing import List, Tuple

from .services import TaskManager
from . import ui
from .utils import validate_menu_choice, validate_task_id_for_menu, sanitize_input


class MenuHandler:
    """
    Menu-driven handler and router for visual CLI interface.
    """

    def __init__(self, task_manager: TaskManager) -> None:
        """Initialize menu handler with a task manager.

        Args:
            task_manager: TaskManager instance for handling operations
        """
        self.task_manager = task_manager

    def route_menu_choice(self, choice: str) -> Tuple[bool, bool]:
        """
        Route user's menu choice to appropriate handler.

        Args:
            choice: Menu choice number (1-7)

        Returns:
            Tuple of (success: bool, should_exit: bool)
        """
        handlers = {
            "1": self.handle_add_task,
            "2": self.handle_list_tasks,
            "3": self.handle_update_task,
            "4": self.handle_toggle_task,
            "5": self.handle_delete_task,
            "6": self.handle_help,
            "7": self.handle_exit,
        }

        handler = handlers.get(choice)
        if handler:
            return handler()
        else:
            ui.display_message("Invalid menu choice.", "error")
            return False, False

    def handle_add_task(self) -> Tuple[bool, bool]:
        """Handle add task operation."""
        title = ui.display_add_form()
        if title is None:
            return False, False  # Cancelled

        success, message, task = self.task_manager.add_task(title)
        if success:
            ui.display_message(message, "success")
        else:
            ui.display_message(message, "error")

        return success, False

    def handle_list_tasks(self) -> Tuple[bool, bool]:
        """Handle list tasks operation."""
        success, message, tasks = self.task_manager.list_tasks()

        if not success:
            ui.display_message(message, "error")
            return False, False

        ui.display_list_view(tasks)
        return True, False

    def handle_update_task(self) -> Tuple[bool, bool]:
        """Handle update task operation."""
        # Get all tasks for selection
        success, message, tasks = self.task_manager.list_tasks()
        if not success or not tasks:
            ui.display_message("No tasks available to update.", "warning")
            return False, False

        # Step 1: Select task
        task_id = ui.display_update_step1(tasks)
        if task_id is None:
            return False, False  # Cancelled

        # Get the specific task
        task = next((t for t in tasks if t.id == task_id), None)
        if not task:
            ui.display_message(f"Task with ID {task_id} not found.", "error")
            return False, False

        # Step 2: Edit title
        new_title = ui.display_update_step2(task)
        if new_title is None:
            return False, False  # Cancelled

        # Execute update
        success, message, updated_task = self.task_manager.update_task(task_id, new_title)
        if success:
            ui.display_message(message, "success")
        else:
            ui.display_message(message, "error")

        return success, False

    def handle_toggle_task(self) -> Tuple[bool, bool]:
        """Handle toggle task operation."""
        # Get all tasks for selection
        success, message, tasks = self.task_manager.list_tasks()
        if not success or not tasks:
            ui.display_message("No tasks available to toggle.", "warning")
            return False, False

        # Select task
        task_id = ui.display_update_step1(tasks)
        if task_id is None:
            return False, False  # Cancelled

        # Get the specific task
        task = next((t for t in tasks if t.id == task_id), None)
        if not task:
            ui.display_message(f"Task with ID {task_id} not found.", "error")
            return False, False

        # Confirm toggle
        if not ui.display_toggle_confirmation(task):
            return False, False  # Cancelled

        # Execute toggle
        success, message, toggled_task = self.task_manager.toggle_task(task_id)
        if success:
            ui.display_message(message, "success")
        else:
            ui.display_message(message, "error")

        return success, False

    def handle_delete_task(self) -> Tuple[bool, bool]:
        """Handle delete task operation."""
        # Get all tasks for selection
        success, message, tasks = self.task_manager.list_tasks()
        if not success or not tasks:
            ui.display_message("No tasks available to delete.", "warning")
            return False, False

        # Select task
        task_id = ui.display_update_step1(tasks)
        if task_id is None:
            return False, False  # Cancelled

        # Get the specific task
        task = next((t for t in tasks if t.id == task_id), None)
        if not task:
            ui.display_message(f"Task with ID {task_id} not found.", "error")
            return False, False

        # Confirm deletion
        if not ui.display_delete_confirmation(task):
            return False, False  # Cancelled

        # Execute deletion
        success, message, deleted_task = self.task_manager.delete_task(task_id)
        if success:
            ui.display_message(message, "success")
        else:
            ui.display_message(message, "error")

        return success, False

    def handle_help(self) -> Tuple[bool, bool]:
        """Handle help operation."""
        ui.display_help()
        return True, False

    def handle_exit(self) -> Tuple[bool, bool]:
        """Handle exit operation."""
        return True, True  # Success and should exit