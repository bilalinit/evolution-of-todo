"""Event publisher utility for Dapr Pub/Sub.

This module provides helper functions for publishing events
to Kafka topics via Dapr's Pub/Sub building block.
"""

import os
from datetime import datetime, timezone
from typing import Any
import uuid
import logging
import httpx

logger = logging.getLogger(__name__)

DAPR_HOST = os.getenv("DAPR_HOST", "localhost")
DAPR_HTTP_PORT = os.getenv("DAPR_HTTP_PORT", "3500")
DAPR_PUBSUB_URL = f"http://{DAPR_HOST}:{DAPR_HTTP_PORT}/v1.0/publish/pubsub"


async def publish_event(
    topic: str,
    event_type: str,
    user_id: str,
    data: dict[str, Any],
) -> str:
    """Publish an event to Dapr Pub/Sub (Kafka).

    Args:
        topic: The Kafka topic to publish to
        event_type: The type of event (e.g., "task-created")
        user_id: The ID of the user who triggered the event
        data: The event payload

    Returns:
        The generated event_id

    Raises:
        httpx.HTTPError: If the publish request fails

    Example:
        event_id = await publish_event(
            topic="task-created",
            event_type="task-created",
            user_id=user_id,
            data={"task_id": str(task.id), "title": task.title}
        )
    """
    event_id = str(uuid.uuid4())

    payload = {
        "event_id": event_id,
        "event_type": event_type,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "user_id": user_id,
        "data": data,
    }

    url = f"{DAPR_PUBSUB_URL}/{topic}"

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(
            url,
            json=payload,
            params={"metadata.partitionKey": user_id}
        )
        response.raise_for_status()

    logger.info(
        f"Published event {event_type} ({event_id}) to topic {topic} "
        f"for user {user_id}"
    )

    return event_id


async def publish_task_created(
    user_id: str,
    task_id: str,
    title: str,
    description: str | None,
    priority: str,
    due_date: str | None,
    reminder_at: str | None,
    recurring_rule: str | None,
    recurring_end_date: str | None,
    tags: list[str],
) -> str:
    """Publish a task-created event.

    Args:
        user_id: The user who created the task
        task_id: The new task ID
        title: Task title
        description: Optional description
        priority: Task priority
        due_date: Optional due date
        reminder_at: Optional reminder time
        recurring_rule: Optional recurrence pattern
        recurring_end_date: Optional recurrence end date
        tags: Task tags

    Returns:
        The generated event_id
    """
    return await publish_event(
        topic="task-created",
        event_type="task-created",
        user_id=user_id,
        data={
            "task_id": task_id,
            "title": title,
            "description": description,
            "priority": priority,
            "due_date": due_date,
            "reminder_at": reminder_at,
            "recurring_rule": recurring_rule,
            "recurring_end_date": recurring_end_date,
            "tags": tags,
        },
    )


async def publish_task_updated(
    user_id: str,
    task_id: str,
    before: dict[str, Any],
    after: dict[str, Any],
) -> str:
    """Publish a task-updated event.

    Args:
        user_id: The user who updated the task
        task_id: The task ID
        before: Task state before update
        after: Task state after update

    Returns:
        The generated event_id
    """
    return await publish_event(
        topic="task-updated",
        event_type="task-updated",
        user_id=user_id,
        data={
            "task_id": task_id,
            "before": before,
            "after": after,
        },
    )


async def publish_task_completed(
    user_id: str,
    task_id: str,
    title: str,
    recurring_rule: str | None,
    recurring_end_date: str | None,
) -> str:
    """Publish a task-completed event.

    Args:
        user_id: The user who completed the task
        task_id: The task ID
        title: Task title
        recurring_rule: Optional recurrence pattern
        recurring_end_date: Optional recurrence end date

    Returns:
        The generated event_id
    """
    print(f"🔔 DEBUG: publish_task_completed called - task_id={task_id}, recurring_rule={recurring_rule}")
    return await publish_event(
        topic="task-completed",
        event_type="task-completed",
        user_id=user_id,
        data={
            "task_id": task_id,
            "title": title,
            "recurring_rule": recurring_rule,
            "recurring_end_date": recurring_end_date,
        },
    )


async def publish_task_deleted(
    user_id: str,
    task_id: str,
    title: str,
) -> str:
    """Publish a task-deleted event.

    Args:
        user_id: The user who deleted the task
        task_id: The task ID
        title: Task title

    Returns:
        The generated event_id
    """
    return await publish_event(
        topic="task-deleted",
        event_type="task-deleted",
        user_id=user_id,
        data={
            "task_id": task_id,
            "title": title,
        },
    )


async def publish_reminder_due(
    user_id: str,
    task_id: str,
    title: str,
    due_date: str,
    reminder_at: str,
    priority: str,
    notification_id: str,
) -> str:
    """Publish a reminder-due event.

    Args:
        user_id: The user who owns the task
        task_id: The task ID
        title: Task title
        due_date: Task due date
        reminder_at: Reminder time
        priority: Task priority
        notification_id: The created notification ID

    Returns:
        The generated event_id
    """
    return await publish_event(
        topic="reminder-due",
        event_type="reminder-due",
        user_id=user_id,
        data={
            "task_id": task_id,
            "title": title,
            "due_date": due_date,
            "reminder_at": reminder_at,
            "priority": priority,
            "notification_id": notification_id,
        },
    )
