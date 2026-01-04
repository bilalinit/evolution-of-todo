"""
Business logic and service layer for the CLI Todo Application.

Contains TaskManager class with in-memory storage operations.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional, Tuple

from .models import Task
from .utils import validate_title


@dataclass
class TaskManager:
    """
    Manages task operations with in-memory storage.

    Phase I: In-memory list storage
    Phase II: Will migrate to database persistence
    """

    tasks: list[Task] = field(default_factory=list)
    next_id: int = 1

    def add_task(self, title: str) -> Tuple[bool, str, Optional[Task]]:
        """
        Add a new task.

        Args:
            title: Task title

        Returns:
            Tuple of (success: bool, message: str, task: Optional[Task])
        """
        try:
            # Validate input
            validated_title = validate_title(title)

            # Create task
            task = Task(
                id=self.next_id,
                title=validated_title,
                completed=False,
                created_at=datetime.now(),
            )

            # Store task
            self.tasks.append(task)
            self.next_id += 1

            return True, f"Task added successfully! (ID: {task.id})", task

        except ValueError as e:
            return False, str(e), None
        except Exception as e:
            return False, f"Unexpected error: {str(e)}", None

    def list_tasks(self) -> Tuple[bool, str, List[Task]]:
        """
        List all tasks sorted by ID.

        Returns:
            Tuple of (success: bool, message: str, tasks: List[Task])
        """
        try:
            if not self.tasks:
                return True, "No tasks found.", []

            # Sort by ID
            sorted_tasks = sorted(self.tasks, key=lambda t: t.id)
            return True, "Tasks retrieved successfully.", sorted_tasks

        except Exception as e:
            return False, f"Error retrieving tasks: {str(e)}", []

    def update_task(
        self, task_id: int, new_title: str
    ) -> Tuple[bool, str, Optional[Task]]:
        """
        Update a task's title.

        Args:
            task_id: ID of task to update
            new_title: New title for the task

        Returns:
            Tuple of (success: bool, message: str, task: Optional[Task])
        """
        try:
            # Validate input
            validated_title = validate_title(new_title)

            # Find task
            task = self._find_task_by_id(task_id)
            if not task:
                return False, f"Task with ID {task_id} not found.", None

            # Update task
            task.title = validated_title
            return True, f"Task {task_id} updated successfully.", task

        except ValueError as e:
            return False, str(e), None
        except Exception as e:
            return False, f"Unexpected error: {str(e)}", None

    def delete_task(self, task_id: int) -> Tuple[bool, str, Optional[Task]]:
        """
        Delete a task by ID.

        Args:
            task_id: ID of task to delete

        Returns:
            Tuple of (success: bool, message: str, task: Optional[Task])
        """
        try:
            # Find task
            task = self._find_task_by_id(task_id)
            if not task:
                return False, f"Task with ID {task_id} not found.", None

            # Remove task
            self.tasks = [t for t in self.tasks if t.id != task_id]
            return True, f"Task {task_id} deleted successfully.", task

        except Exception as e:
            return False, f"Error deleting task: {str(e)}", None

    def toggle_task(self, task_id: int) -> Tuple[bool, str, Optional[Task]]:
        """
        Toggle task completion status.

        Args:
            task_id: ID of task to toggle

        Returns:
            Tuple of (success: bool, message: str, task: Optional[Task])
        """
        try:
            # Find task
            task = self._find_task_by_id(task_id)
            if not task:
                return False, f"Task with ID {task_id} not found.", None

            # Toggle completion
            task.completed = not task.completed
            status = "completed" if task.completed else "pending"
            return True, f"Task {task_id} marked as {status}.", task

        except Exception as e:
            return False, f"Error toggling task: {str(e)}", None

    def _find_task_by_id(self, task_id: int) -> Optional[Task]:
        """
        Find a task by ID.

        Args:
            task_id: Task ID to find

        Returns:
            Task if found, None otherwise
        """
        for task in self.tasks:
            if task.id == task_id:
                return task
        return None
