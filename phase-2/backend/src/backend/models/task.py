"""
Task models and schemas.
Defines SQLModel entities and Pydantic request/response models.
"""
from datetime import datetime, date
from typing import Optional, List
from uuid import UUID, uuid4
from enum import Enum

from sqlmodel import Field, SQLModel
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

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            UUID: lambda v: str(v),
            datetime: lambda v: v.isoformat() if v else None,
            date: lambda v: v.isoformat() if v else None
        }


# ==================== Request Models ====================

class TaskCreate(BaseModel):
    """Request model for creating a new task."""
    title: str
    description: Optional[str] = None
    priority: Priority = Priority.MEDIUM
    category: Category = Category.OTHER
    due_date: Optional[date] = None


class TaskUpdate(BaseModel):
    """Request model for updating an existing task."""
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[Priority] = None
    category: Optional[Category] = None
    due_date: Optional[date] = None


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
            updated_at=task.updated_at
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