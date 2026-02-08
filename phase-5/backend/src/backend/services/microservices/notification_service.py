"""Notification Service - Handles reminder checking and notification creation.

This microservice subscribes to cron binding events and creates notifications
for tasks with due reminders.
"""

import logging
import os
from datetime import datetime, timezone
from typing import Any

from fastapi import FastAPI
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from backend.database import async_session_factory
from backend.models.task import Task
from backend.models.notification import Notification
from backend.utils.idempotency import check_and_mark_processed
from backend.utils.event_publisher import publish_event

logger = logging.getLogger(__name__)

# Service configuration
SERVICE_NAME = "notification-service"
SERVICE_PORT = int(os.getenv("PORT", "8002"))

# Create FastAPI app
app = FastAPI(
    title="Notification Service",
    description="Checks for due reminders and creates notifications",
    version="1.0.0",
)

# Create Dapr app


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": SERVICE_NAME,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


async def create_notification_for_task(
    session: AsyncSession,
    task: Task,
) -> Notification:
    """Create a notification for a task with a due reminder.

    Args:
        session: Database session
        task: Task with due reminder

    Returns:
        Created Notification
    """
    notification = Notification(
        user_id=task.user_id,
        task_id=task.id,
        message=f"Reminder: '{task.title}' is due!",
        notification_type="reminder",
        read=False,
    )
    session.add(notification)
    await session.commit()
    await session.refresh(notification)

    logger.info(
        f"Created notification {notification.id} for task {task.id}, user {task.user_id}"
    )

    return notification


async def mark_reminder_sent(session: AsyncSession, task: Task):
    """Mark task reminder as sent.

    Args:
        session: Database session
        task: Task to update
    """
    task.reminder_sent = True
    await session.commit()
    logger.info(f"Marked reminder_sent=True for task {task.id}")


@app.post("/cron-binding")
async def handle_cron_trigger(event_data: dict[str, Any] = None):
    """Handle cron binding trigger - check for due reminders.

    This handler runs every minute via Dapr cron binding.
    It queries for tasks with due reminders that haven't been sent yet.

    Args:
        event_data: Event payload from Dapr cron binding
    """
    logger.info("Cron trigger: checking for due reminders")

    async with async_session_factory() as session:
        try:
            # Query for tasks with due reminders that haven't been sent
            now = datetime.utcnow()  # Naive UTC for database comparison

            result = await session.execute(
                select(Task).where(
                    and_(
                        Task.reminder_at <= now,
                        Task.reminder_sent.is_(False),  # type: ignore
                        Task.completed.is_(False),  # type: ignore
                    )
                )
            )
            due_tasks = result.scalars().all()

            logger.info(f"Found {len(due_tasks)} tasks with due reminders")

            created_count = 0
            for task in due_tasks:
                try:
                    # Create notification
                    notification = await create_notification_for_task(session, task)

                    # Mark reminder as sent
                    await mark_reminder_sent(session, task)

                    # Publish reminder-due event
                    await publish_event(
                        topic="reminder-due",
                        event_type="reminder-due",
                        user_id=task.user_id,
                        data={
                            "task_id": str(task.id),
                            "notification_id": str(notification.id),
                            "title": task.title,
                            "due_date": task.due_date.isoformat() if task.due_date else None,
                            "reminder_at": task.reminder_at.isoformat()
                            if task.reminder_at
                            else None,
                        },
                    )

                    created_count += 1

                except Exception as e:
                    logger.exception(
                        f"Error processing reminder for task {task.id}: {e}"
                    )
                    # Continue with other tasks
                    continue

            logger.info(f"Created {created_count} notifications for due reminders")
            return {
                "status": "processed",
                "tasks_checked": len(due_tasks),
                "notifications_created": created_count,
            }

        except Exception as e:
            logger.exception(f"Error in cron handler: {e}")
            return {"status": "error", "reason": str(e)}


@app.get("/api/{user_id}/notifications")
async def get_notifications(user_id: str, unread_only: bool = False):
    """Get notifications for a user.

    Args:
        user_id: User ID
        unread_only: If True, only return unread notifications

    Returns:
        List of notifications
    """
    async with async_session_factory() as session:
        query = select(Notification).where(Notification.user_id == user_id)

        if unread_only:
            query = query.where(Notification.read.is_(False))  # type: ignore

        query = query.order_by(Notification.created_at.desc())

        result = await session.execute(query)
        notifications = result.scalars().all()

        return {
            "notifications": [
                {
                    "id": str(n.id),
                    "task_id": str(n.task_id) if n.task_id else None,
                    "message": n.message,
                    "notification_type": n.notification_type,
                    "read": n.read,
                    "created_at": n.created_at.isoformat() if n.created_at else None,
                }
                for n in notifications
            ],
            "count": len(notifications),
        }


@app.patch("/api/notifications/{notification_id}")
async def mark_notification_read(notification_id: str):
    """Mark a notification as read.

    Args:
        notification_id: Notification ID (UUID string)

    Returns:
        Updated notification
    """
    from uuid import UUID

    async with async_session_factory() as session:
        result = await session.execute(
            select(Notification).where(Notification.id == UUID(notification_id))
        )
        notification = result.scalar_one_or_none()

        if not notification:
            return {"error": "Notification not found"}, 404

        notification.read = True
        await session.commit()
        await session.refresh(notification)

        return {
            "id": str(notification.id),
            "read": notification.read,
        }


@app.delete("/api/notifications/{notification_id}")
async def delete_notification(notification_id: str):
    """Delete a notification.

    Args:
        notification_id: Notification ID (UUID string)

    Returns:
        204 No Content on success
    """
    from uuid import UUID

    async with async_session_factory() as session:
        result = await session.execute(
            select(Notification).where(Notification.id == UUID(notification_id))
        )
        notification = result.scalar_one_or_none()

        if not notification:
            return {"error": "Notification not found"}, 404

        await session.delete(notification)
        await session.commit()

        return None, 204


@app.on_event("startup")
async def startup():
    """Log service startup."""
    logger.info(f"{SERVICE_NAME} starting up on port {SERVICE_PORT}")


@app.on_event("shutdown")
async def shutdown():
    """Log service shutdown."""
    logger.info(f"{SERVICE_NAME} shutting down")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "notification_service:app",
        host="0.0.0.0",
        port=SERVICE_PORT,
        reload=False,
    )
