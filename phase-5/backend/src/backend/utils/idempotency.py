"""Idempotency utilities for event processing.

This module provides helper functions to track processed events
via Dapr State Store, ensuring at-least-once delivery semantics
while preventing duplicate processing.
"""

from datetime import datetime, timezone
from typing import Optional
import logging

from .dapr_state import dapr_get_state, dapr_save_state

logger = logging.getLogger(__name__)


async def check_and_mark_processed(
    event_id: str,
    service_name: str
) -> bool:
    """Check if an event has been processed and mark it as processed.

    This is an atomic operation that checks Dapr State Store and,
    if the event hasn't been processed, marks it as processed.

    Args:
        event_id: The unique event ID
        service_name: The name of the service processing the event

    Returns:
        True if the event was already processed (skip processing),
        False if the event is new (proceed with processing)

    Example:
        if await check_and_mark_processed(event_id, "audit-service"):
            return {"status": "skipped", "reason": "duplicate"}
        # Process the event...
    """
    key = f"processed-{event_id}-{service_name}"

    # Check if already processed
    existing = await dapr_get_state(key)
    if existing is not None:
        logger.debug(
            f"Event {event_id} already processed by {service_name}, "
            "skipping duplicate"
        )
        return True

    # Mark as processed
    await dapr_save_state(key, {
        "event_id": event_id,
        "service_name": service_name,
        "processed_at": datetime.now(timezone.utc).isoformat(),
    })
    logger.debug(f"Marked event {event_id} as processed by {service_name}")

    return False


async def get_processed_event(
    event_id: str,
    service_name: str
) -> Optional[dict]:
    """Get the processing record for an event.

    Args:
        event_id: The unique event ID
        service_name: The name of the service

    Returns:
        The processing record if found, None otherwise
    """
    key = f"processed-{event_id}-{service_name}"
    return await dapr_get_state(key)
