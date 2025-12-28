"""
Data models for the CLI Todo Application.

Phase I: In-memory storage using dataclasses.
Phase II: Will migrate to SQLModel for database persistence.
"""

from dataclasses import dataclass
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator


@dataclass
class Task:
    """Core todo item for in-memory storage."""

    id: int  # Unique identifier, auto-incremented
    title: str  # Task title/description (required, non-empty)
    completed: bool  # Completion status (default: False)
    created_at: datetime  # Timestamp of creation


class TaskCreate(BaseModel):
    """Input validation for creating a new task."""

    title: str = Field(..., min_length=1, max_length=500)

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        """Validate task title for creation.

        Args:
            v: Title string to validate

        Returns:
            Sanitized title

        Raises:
            ValueError: If title is empty or whitespace-only
        """
        v = v.strip()
        if not v:
            raise ValueError("Task title cannot be empty")
        return v


class TaskUpdate(BaseModel):
    """Input validation for updating a task."""

    title: Optional[str] = Field(None, min_length=1, max_length=500)

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        """Validate task title for updates.

        Args:
            v: Optional title string to validate

        Returns:
            Sanitized title or None

        Raises:
            ValueError: If title is empty or whitespace-only
        """
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("Task title cannot be empty")
        return v


@dataclass
class TaskDisplay:
    """Output model for CLI display."""

    id: int
    title: str
    completed: bool
    created_at: datetime
