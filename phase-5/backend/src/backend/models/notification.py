"""
Notification models and schemas.
Defines SQLModel entity for in-app notifications.
"""
from datetime import datetime
from typing import Optional, List
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel
from pydantic import BaseModel


# ==================== Database Models ====================

class Notification(SQLModel, table=True):
    """Notification entity - in-app notifications for users."""

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: str = Field(index=True, description="Recipient user ID")
    message: str = Field(description="Notification message text")
    read: bool = Field(default=False, index=True, description="Read status")
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True, description="Creation timestamp")
    task_id: Optional[UUID] = Field(default=None, foreign_key="task.id", index=True, description="Related task (optional)")

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            UUID: lambda v: str(v),
            datetime: lambda v: v.isoformat() if v else None
        }


# ==================== Response Models ====================

class NotificationResponse(BaseModel):
    """Response model for notification data."""
    id: str
    user_id: str
    message: str
    read: bool
    created_at: datetime
    task_id: Optional[str] = None

    @classmethod
    def from_notification(cls, notification: Notification) -> "NotificationResponse":
        """Convert Notification model to NotificationResponse."""
        return cls(
            id=str(notification.id),
            user_id=notification.user_id,
            message=notification.message,
            read=notification.read,
            created_at=notification.created_at,
            task_id=str(notification.task_id) if notification.task_id else None
        )


class NotificationListResponse(BaseModel):
    """Response model for notification list with unread count."""
    notifications: List[NotificationResponse]
    total: int
    unread_count: int

    @classmethod
    def from_notifications(cls, notifications: List[Notification]) -> "NotificationListResponse":
        """Convert list of Notification models to NotificationListResponse."""
        notification_responses = [NotificationResponse.from_notification(n) for n in notifications]
        unread = sum(1 for n in notifications if not n.read)
        return cls(
            notifications=notification_responses,
            total=len(notifications),
            unread_count=unread
        )
