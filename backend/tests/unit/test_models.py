"""
Unit tests for data models and validation schemas.
"""
import pytest
from datetime import datetime
from pydantic import ValidationError

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'src'))

from backend.models import Task, TaskCreate, TaskUpdate, TaskDisplay


class TestTask:
    """Test Task dataclass."""

    def test_task_creation(self):
        """Test creating a Task with valid data."""
        task = Task(
            id=1,
            title="Test Task",
            completed=False,
            created_at=datetime.now()
        )
        assert task.id == 1
        assert task.title == "Test Task"
        assert task.completed is False
        assert isinstance(task.created_at, datetime)

    def test_task_attributes(self):
        """Test Task has all required attributes."""
        task = Task(
            id=1,
            title="Test",
            completed=True,
            created_at=datetime.now()
        )
        assert hasattr(task, 'id')
        assert hasattr(task, 'title')
        assert hasattr(task, 'completed')
        assert hasattr(task, 'created_at')


class TestTaskCreate:
    """Test TaskCreate Pydantic model."""

    def test_valid_title(self):
        """Test valid task creation."""
        model = TaskCreate(title="Valid Task Title")
        assert model.title == "Valid Task Title"

    def test_title_stripping(self):
        """Test that titles are stripped."""
        model = TaskCreate(title="  Task with spaces  ")
        assert model.title == "Task with spaces"

    def test_empty_title_raises_error(self):
        """Test empty title raises ValidationError."""
        with pytest.raises(ValidationError):
            TaskCreate(title="")

    def test_whitespace_only_title_raises_error(self):
        """Test whitespace-only title raises ValidationError."""
        with pytest.raises(ValidationError):
            TaskCreate(title="   ")

    def test_title_too_long_raises_error(self):
        """Test very long title raises ValidationError."""
        long_title = "A" * 501
        with pytest.raises(ValidationError):
            TaskCreate(title=long_title)

    def test_max_length_title(self):
        """Test title at maximum length."""
        max_title = "A" * 500
        model = TaskCreate(title=max_title)
        assert model.title == max_title


class TestTaskUpdate:
    """Test TaskUpdate Pydantic model."""

    def test_valid_update(self):
        """Test valid task update."""
        model = TaskUpdate(title="Updated Title")
        assert model.title == "Updated Title"

    def test_none_title(self):
        """Test None title is allowed."""
        model = TaskUpdate(title=None)
        assert model.title is None

    def test_empty_title_raises_error(self):
        """Test empty title raises ValidationError."""
        with pytest.raises(ValidationError):
            TaskUpdate(title="")

    def test_whitespace_only_raises_error(self):
        """Test whitespace-only title raises ValidationError."""
        with pytest.raises(ValidationError):
            TaskUpdate(title="   ")

    def test_title_stripping(self):
        """Test that titles are stripped."""
        model = TaskUpdate(title="  Updated  ")
        assert model.title == "Updated"


class TestTaskDisplay:
    """Test TaskDisplay dataclass."""

    def test_task_display_creation(self):
        """Test creating TaskDisplay."""
        display = TaskDisplay(
            id=1,
            title="Test",
            completed=True,
            created_at=datetime.now()
        )
        assert display.id == 1
        assert display.title == "Test"
        assert display.completed is True
        assert isinstance(display.created_at, datetime)

    def test_task_display_attributes(self):
        """Test TaskDisplay has all required attributes."""
        display = TaskDisplay(
            id=1,
            title="Test",
            completed=False,
            created_at=datetime.now()
        )
        assert hasattr(display, 'id')
        assert hasattr(display, 'title')
        assert hasattr(display, 'completed')
        assert hasattr(display, 'created_at')