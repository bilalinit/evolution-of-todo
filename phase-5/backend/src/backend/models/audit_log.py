"""
Audit log models and schemas.
Defines SQLModel entity for tracking all task operations.
"""
from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel, Column
from sqlalchemy import JSON
from pydantic import BaseModel, Json


class EventType(str, Enum):
    """Types of audit events."""
    TASK_CREATED = "task_created"
    TASK_UPDATED = "task_updated"
    TASK_COMPLETED = "task_completed"
    TASK_DELETED = "task_deleted"


# ==================== Database Models ====================

class AuditLog(SQLModel, table=True):
    """Audit log entity - tracks all operations on entities."""

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    event_type: EventType = Field(sa_column_kwargs={"nullable": False})
    entity_type: str = Field(description="Type of entity (e.g., 'task')")
    entity_id: UUID = Field(description="ID of the affected entity")
    user_id: str = Field(index=True, description="User who performed the action")
    timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)
    data: dict = Field(default={}, sa_column=Column(JSON), description="Event data snapshot")

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            UUID: lambda v: str(v),
            datetime: lambda v: v.isoformat() if v else None
        }


# ==================== Response Models ====================

class AuditLogResponse(BaseModel):
    """Response model for audit log entries."""
    id: str
    event_type: EventType
    entity_type: str
    entity_id: str
    user_id: str
    timestamp: datetime
    data: dict

    @classmethod
    def from_audit_log(cls, log: AuditLog) -> "AuditLogResponse":
        """Convert AuditLog model to AuditLogResponse."""
        return cls(
            id=str(log.id),
            event_type=log.event_type,
            entity_type=log.entity_type,
            entity_id=str(log.entity_id),
            user_id=log.user_id,
            timestamp=log.timestamp,
            data=log.data
        )


class AuditLogListResponse(BaseModel):
    """Response model for audit log list with pagination."""
    logs: list["AuditLogResponse"]
    total: int
    limit: int
    offset: int
