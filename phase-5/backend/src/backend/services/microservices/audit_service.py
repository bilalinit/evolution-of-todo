"""Audit Service - Logs all task events to the audit trail.

This microservice subscribes to all task events (created, updated, completed, deleted)
and maintains a complete audit trail of all operations.
"""

import logging
import os
from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from fastapi import FastAPI, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from backend.database import async_session_factory
from backend.models.audit_log import AuditLog, EventType

logger = logging.getLogger(__name__)

# Service configuration
SERVICE_NAME = "audit-service"
SERVICE_PORT = int(os.getenv("PORT", "8003"))

# Create FastAPI app
app = FastAPI(
    title="Audit Service",
    description="Logs all task operations to the audit trail",
    version="1.0.0",
)


class AuditLogResponse(BaseModel):
    """Response model for audit log entries."""
    id: str
    event_type: EventType
    entity_type: str
    entity_id: str
    user_id: str
    timestamp: datetime
    data: dict


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": SERVICE_NAME,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


async def log_event(
    event_type: EventType,
    entity_type: str,
    entity_id: UUID,
    user_id: str,
    data: dict[str, Any],
) -> AuditLog | None:
    """Log an audit event to the database.

    Args:
        event_type: Type of event
        entity_type: Type of entity (e.g., 'task')
        entity_id: ID of the affected entity
        user_id: User who performed the action
        data: Event data snapshot

    Returns:
        AuditLog if successful, None if failed
    """
    async with async_session_factory() as session:
        try:
            log = AuditLog(
                event_type=event_type,
                entity_type=entity_type,
                entity_id=entity_id,
                user_id=user_id,
                timestamp=datetime.now(timezone.utc),
                data=data,
            )
            session.add(log)
            await session.commit()
            await session.refresh(log)
            logger.info(
                f"Logged {event_type.value} for {entity_type}:{entity_id} "
                f"by user {user_id}"
            )
            return log
        except Exception as e:
            logger.error(f"Failed to log audit event: {e}")
            return None


async def handle_event_with_idempotency(
    event_data: dict[str, Any],
    event_type: EventType,
) -> dict[str, Any]:
    """Handle an event with idempotency check.

    Args:
        event_data: Event payload from Dapr
        event_type: The type of event to log

    Returns:
        Response status dictionary
    """
    from backend.utils.idempotency import check_and_mark_processed

    # Dapr wraps our payload in the 'data' field (CloudEvents format)
    cloud_data = event_data.get("data", {})
    if not cloud_data:
        # If not wrapped, use event_data directly (for backward compatibility)
        cloud_data = event_data
    
    event_id = cloud_data.get("event_id")
    user_id = cloud_data.get("user_id")
    data = cloud_data.get("data", {})

    # Idempotency check - skip if already processed
    if await check_and_mark_processed(event_id, SERVICE_NAME):
        logger.info(
            f"Event {event_id} already processed by {SERVICE_NAME}, skipping"
        )
        return {"status": "skipped", "reason": "already_processed"}

    try:
        entity_id = UUID(data.get("task_id"))
    except (ValueError, TypeError):
        logger.error(f"Invalid task_id in event: {data.get('task_id')}")
        return {"status": "error", "reason": "invalid_task_id"}

    # Log the event
    await log_event(
        event_type=event_type,
        entity_type="task",
        entity_id=entity_id,
        user_id=user_id,
        data=data,
    )

    return {"status": "processed"}


@app.post("/events/task-created")
async def handle_task_created(event_data: dict[str, Any]):
    """Handle task-created event."""
    return await handle_event_with_idempotency(event_data, EventType.TASK_CREATED)


@app.post("/events/task-updated")
async def handle_task_updated(event_data: dict[str, Any]):
    """Handle task-updated event."""
    return await handle_event_with_idempotency(event_data, EventType.TASK_UPDATED)


@app.post("/events/task-completed")
async def handle_task_completed(event_data: dict[str, Any]):
    """Handle task-completed event."""
    return await handle_event_with_idempotency(event_data, EventType.TASK_COMPLETED)


@app.post("/events/task-deleted")
async def handle_task_deleted(event_data: dict[str, Any]):
    """Handle task-deleted event."""
    return await handle_event_with_idempotency(event_data, EventType.TASK_DELETED)


@app.get("/api/{user_id}/audit")
async def get_audit_logs(user_id: str, limit: int = 100, offset: int = 0):
    """Get audit logs for a user.

    Args:
        user_id: User ID to get logs for
        limit: Maximum number of logs to return
        offset: Number of logs to skip

    Returns:
        List of audit log entries
    """
    from sqlalchemy import select

    async with async_session_factory() as session:
        query = (
            select(AuditLog)
            .where(AuditLog.user_id == user_id)
            .order_by(AuditLog.timestamp.desc())
            .limit(limit)
            .offset(offset)
        )

        result = await session.execute(query)
        logs = result.scalars().all()

        return {
            "logs": [
                AuditLogResponse(
                    id=str(log.id),
                    event_type=log.event_type,
                    entity_type=log.entity_type,
                    entity_id=str(log.entity_id),
                    user_id=log.user_id,
                    timestamp=log.timestamp,
                    data=log.data,
                )
                for log in logs
            ],
            "total": len(logs),
            "limit": limit,
            "offset": offset,
        }


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
        "audit_service:app",
        host="0.0.0.0",
        port=SERVICE_PORT,
        reload=False,
    )
