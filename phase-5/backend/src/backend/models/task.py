"""
Task models and schemas.
Defines SQLModel entities and Pydantic request/response models.
"""
from datetime import datetime, date
from typing import Optional, List, Dict, Any
from uuid import UUID, uuid4
from enum import Enum

from sqlmodel import Field, SQLModel, Column
from sqlalchemy import JSON
from pydantic import BaseModel


class Priority(str, Enum):
    """Task priority levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Category(str, Enum):
    """Task categories."""
    WORK = "work"
    PERSONAL = "personal"
    SHOPPING = "shopping"
    HEALTH = "health"
    OTHER = "other"


# ==================== Database Models ====================

class Task(SQLModel, table=True):
    """Task entity - represents a single todo item owned by a user."""

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)
    priority: Priority = Field(default=Priority.MEDIUM, sa_column_kwargs={"nullable": False})
    category: Category = Field(default=Category.OTHER, sa_column_kwargs={"nullable": False})
    due_date: Optional[date] = Field(default=None)
    user_id: str = Field(index=True)  # References Better Auth user.id
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Phase 5 Advanced Features
    recurring_rule: Optional[str] = Field(
        default=None,
        description="Recurrence rule: daily, weekly, monthly, yearly"
    )
    recurring_end_date: Optional[datetime] = Field(
        default=None,
        description="Last date for recurrence generation"
    )
    parent_task_id: Optional[UUID] = Field(
        default=None,
        foreign_key="task.id",
        description="Links recurring instances to parent task"
    )
    reminder_at: Optional[datetime] = Field(
        default=None,
        description="When to send reminder (UTC)"
    )
    reminder_sent: bool = Field(
        default=False,
        description="Whether reminder has been sent"
    )
    tags: List[str] = Field(
        default=[],
        sa_column=Column("tags", JSON, default=list),
        description="Array of tag strings"
    )

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            UUID: lambda v: str(v),
            datetime: lambda v: v.isoformat() if v else None,
            date: lambda v: v.isoformat() if v else None
        }

    def to_dict(self) -> dict:
        """Convert Task model to dictionary for MCP responses."""
        return {
            "id": str(self.id),
            "title": self.title,
            "description": self.description,
            "completed": self.completed,
            "priority": self.priority.value,
            "category": self.category.value,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "recurring_rule": self.recurring_rule,
            "recurring_end_date": self.recurring_end_date.isoformat() if self.recurring_end_date else None,
            "parent_task_id": str(self.parent_task_id) if self.parent_task_id else None,
            "reminder_at": self.reminder_at.isoformat() if self.reminder_at else None,
            "reminder_sent": self.reminder_sent,
            "tags": self.tags
        }


# ==================== Request Models ====================

class TaskCreate(BaseModel):
    """Request model for creating a new task."""
    title: str
    description: Optional[str] = None
    priority: Priority = Priority.MEDIUM
    category: Category = Category.OTHER
    due_date: Optional[date] = None
    # Phase 5 Advanced Features
    recurring_rule: Optional[str] = None
    recurring_end_date: Optional[datetime] = None
    reminder_at: Optional[datetime] = None
    tags: Optional[List[str]] = None


class TaskUpdate(BaseModel):
    """Request model for updating an existing task."""
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[Priority] = None
    category: Optional[Category] = None
    due_date: Optional[date] = None
    # Phase 5 Advanced Features
    recurring_rule: Optional[str] = None
    recurring_end_date: Optional[datetime] = None
    reminder_at: Optional[datetime] = None
    tags: Optional[List[str]] = None


# ==================== Response Models ====================

class TaskResponse(BaseModel):
    """Base response model for task data."""
    id: str
    title: str
    description: Optional[str]
    completed: bool
    priority: Priority
    category: Category
    due_date: Optional[date]
    user_id: str
    created_at: datetime
    updated_at: datetime
    # Phase 5 Advanced Features
    recurring_rule: Optional[str] = None
    recurring_end_date: Optional[datetime] = None
    parent_task_id: Optional[str] = None
    reminder_at: Optional[datetime] = None
    reminder_sent: bool = False
    tags: List[str] = []

    @classmethod
    def from_task(cls, task: Task) -> "TaskResponse":
        """Convert Task model to TaskResponse."""
        return cls(
            id=str(task.id),
            title=task.title,
            description=task.description,
            completed=task.completed,
            priority=task.priority,
            category=task.category,
            due_date=task.due_date,
            user_id=task.user_id,
            created_at=task.created_at,
            updated_at=task.updated_at,
            recurring_rule=task.recurring_rule,
            recurring_end_date=task.recurring_end_date,
            parent_task_id=str(task.parent_task_id) if task.parent_task_id else None,
            reminder_at=task.reminder_at,
            reminder_sent=task.reminder_sent,
            tags=task.tags or []
        )


class TaskDetailResponse(BaseModel):
    """Response model for single task detail."""
    task: TaskResponse

    @classmethod
    def from_task(cls, task: Task) -> "TaskDetailResponse":
        return cls(task=TaskResponse.from_task(task))


class TaskListResponse(BaseModel):
    """Response model for task list with statistics."""
    tasks: List[TaskResponse]
    total: int
    completed_count: int
    pending_count: int

    @classmethod
    def from_tasks(cls, tasks: List[Task]) -> "TaskListResponse":
        """Convert list of Task models to TaskListResponse."""
        task_responses = [TaskResponse.from_task(task) for task in tasks]
        completed = sum(1 for t in tasks if t.completed)
        return cls(
            tasks=task_responses,
            total=len(tasks),
            completed_count=completed,
            pending_count=len(tasks) - completed
        )


# ==================== Profile Models ====================

class UserStats(BaseModel):
    """User task statistics."""
    total_tasks: int
    completed_tasks: int
    pending_tasks: int


class UserInfo(BaseModel):
    """User information (simplified - would come from Better Auth)."""
    id: str
    email: str
    name: str


class UserProfileResponse(BaseModel):
    """Response model for user profile with statistics."""
    user: UserInfo
    stats: UserStats