"""
Unit tests for TaskManager service layer.
"""
import pytest
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'src'))
from datetime import datetime

from backend.services import TaskManager


class TestTaskManager:
    """Test TaskManager class."""

    def setup_method(self):
        """Set up fresh TaskManager for each test."""
        self.tm = TaskManager()

    def test_initial_state(self):
        """Test TaskManager starts with empty tasks."""
        assert len(self.tm.tasks) == 0
        assert self.tm.next_id == 1

    def test_add_task_success(self):
        """Test adding a task successfully."""
        success, message, task = self.tm.add_task("Test Task")
        assert success is True
        assert "added successfully" in message
        assert "ID: 1" in message
        assert task is not None
        assert task.id == 1
        assert task.title == "Test Task"
        assert task.completed is False
        assert isinstance(task.created_at, datetime)

    def test_add_task_empty_title(self):
        """Test adding task with empty title fails."""
        success, message, task = self.tm.add_task("")
        assert success is False
        assert "cannot be empty" in message
        assert task is None

    def test_add_task_whitespace_title(self):
        """Test adding task with whitespace title fails."""
        success, message, task = self.tm.add_task("   ")
        assert success is False
        assert "cannot be empty" in message
        assert task is None

    def test_add_multiple_tasks(self):
        """Test adding multiple tasks."""
        self.tm.add_task("Task 1")
        self.tm.add_task("Task 2")
        self.tm.add_task("Task 3")

        assert len(self.tm.tasks) == 3
        assert self.tm.next_id == 4

    def test_list_tasks_empty(self):
        """Test listing tasks when empty."""
        success, message, tasks = self.tm.list_tasks()
        assert success is True
        assert "No tasks found" in message
        assert len(tasks) == 0

    def test_list_tasks_with_data(self):
        """Test listing tasks with data."""
        self.tm.add_task("Task 1")
        self.tm.add_task("Task 2")

        success, message, tasks = self.tm.list_tasks()
        assert success is True
        assert len(tasks) == 2
        assert tasks[0].id == 1
        assert tasks[1].id == 2

    def test_list_tasks_sorted_by_id(self):
        """Test tasks are sorted by ID."""
        self.tm.add_task("Task 2")
        self.tm.add_task("Task 1")
        self.tm.add_task("Task 3")

        success, message, tasks = self.tm.list_tasks()
        assert tasks[0].id == 1
        assert tasks[1].id == 2
        assert tasks[2].id == 3

    def test_update_task_success(self):
        """Test updating task successfully."""
        self.tm.add_task("Original")
        success, message, task = self.tm.update_task(1, "Updated")
        assert success is True
        assert "updated successfully" in message
        assert task.title == "Updated"

    def test_update_task_not_found(self):
        """Test updating non-existent task."""
        success, message, task = self.tm.update_task(99, "Updated")
        assert success is False
        assert "not found" in message
        assert task is None

    def test_update_task_empty_title(self):
        """Test updating task with empty title."""
        self.tm.add_task("Original")
        success, message, task = self.tm.update_task(1, "")
        assert success is False
        assert "cannot be empty" in message

    def test_delete_task_success(self):
        """Test deleting task successfully."""
        self.tm.add_task("Task 1")
        success, message, task = self.tm.delete_task(1)
        assert success is True
        assert "deleted successfully" in message
        assert len(self.tm.tasks) == 0

    def test_delete_task_not_found(self):
        """Test deleting non-existent task."""
        success, message, task = self.tm.delete_task(99)
        assert success is False
        assert "not found" in message

    def test_toggle_task_success(self):
        """Test toggling task completion."""
        self.tm.add_task("Task 1")
        task = self.tm.tasks[0]
        initial_state = task.completed

        success, message, task = self.tm.toggle_task(1)
        assert success is True
        assert "marked as completed" in message
        assert task.completed is True

        success, message, task = self.tm.toggle_task(1)
        assert success is True
        assert "marked as pending" in message
        assert task.completed is False

    def test_toggle_task_not_found(self):
        """Test toggling non-existent task."""
        success, message, task = self.tm.toggle_task(99)
        assert success is False
        assert "not found" in message

    def test_find_task_by_id(self):
        """Test internal _find_task_by_id method."""
        self.tm.add_task("Task 1")
        self.tm.add_task("Task 2")

        task = self.tm._find_task_by_id(1)
        assert task is not None
        assert task.id == 1

        task = self.tm._find_task_by_id(99)
        assert task is None

    def test_update_task_exception_handling(self):
        """Test update task handles exceptions gracefully."""
        # This should not raise an exception
        success, message, task = self.tm.update_task(999, "Test")
        assert success is False
        assert task is None

    def test_delete_task_exception_handling(self):
        """Test delete task handles exceptions gracefully."""
        success, message, task = self.tm.delete_task(999)
        assert success is False
        assert task is None

    def test_toggle_task_exception_handling(self):
        """Test toggle task handles exceptions gracefully."""
        success, message, task = self.tm.toggle_task(999)
        assert success is False
        assert task is None

    def test_list_tasks_exception_handling(self):
        """Test list tasks handles exceptions gracefully."""
        # This should work fine
        success, message, tasks = self.tm.list_tasks()
        assert success is True
        assert tasks == []