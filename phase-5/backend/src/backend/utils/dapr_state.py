"""Dapr State Store utilities for distributed state management.

This module provides helper functions for interacting with Dapr's
State Store building block, backed by PostgreSQL in this implementation.
Used for idempotency tracking and distributed state.
"""

import os
from typing import Any, Optional
import httpx
import logging

logger = logging.getLogger(__name__)

DAPR_HOST = os.getenv("DAPR_HOST", "localhost")
DAPR_HTTP_PORT = os.getenv("DAPR_HTTP_PORT", "3500")
DAPR_STATE_URL = f"http://{DAPR_HOST}:{DAPR_HTTP_PORT}/v1.0/state/statestore"


async def dapr_save_state(key: str, value: dict[str, Any]) -> None:
    """Save a value to Dapr State Store.

    Args:
        key: The key to store the value under
        value: The value to store (will be JSON serialized)

    Raises:
        httpx.HTTPError: If the request fails
    """
    state = [{
        "key": key,
        "value": value,
    }]

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(DAPR_STATE_URL, json=state)
        response.raise_for_status()
        logger.debug(f"Saved state to Dapr: key={key}")


async def dapr_get_state(key: str) -> Optional[dict[str, Any]]:
    """Get a value from Dapr State Store.

    Args:
        key: The key to retrieve

    Returns:
        The value if found, None otherwise

    Raises:
        httpx.HTTPError: If the request fails (except 404)
    """
    url = f"{DAPR_STATE_URL}/{key}"

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url)

        if response.status_code == 404:
            return None

        response.raise_for_status()

        # Dapr returns the value directly (not wrapped)
        if response.content:
            return response.json()

        return None


async def dapr_delete_state(key: str) -> None:
    """Delete a value from Dapr State Store.

    Args:
        key: The key to delete

    Raises:
        httpx.HTTPError: If the request fails
    """
    url = f"{DAPR_STATE_URL}/{key}"

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.delete(url)
        response.raise_for_status()
        logger.debug(f"Deleted state from Dapr: key={key}")
