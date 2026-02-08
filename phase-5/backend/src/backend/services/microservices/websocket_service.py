"""WebSocket Service - Manages real-time task updates to connected clients.

This microservice maintains WebSocket and SSE connections with clients and broadcasts
task updates in real-time as events are received from the message broker.
"""

import asyncio
import json
import logging
import os
from collections import defaultdict
from datetime import datetime, timezone
from typing import Any, Dict, Set

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse

logger = logging.getLogger(__name__)

# Service configuration
SERVICE_NAME = "websocket-service"
SERVICE_PORT = int(os.getenv("PORT", "8004"))

# Create FastAPI app
app = FastAPI(
    title="WebSocket Service",
    description="Real-time task updates via WebSocket",
    version="1.0.0",
)

# Create Dapr app


class ConnectionManager:
    """Manages WebSocket connections per user."""

    def __init__(self):
        # Map user_id -> set of active WebSocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = defaultdict(set)

    async def connect(self, user_id: str, websocket: WebSocket):
        """Accept a WebSocket connection and track it.

        Args:
            user_id: The user ID for this connection
            websocket: The WebSocket connection
        """
        await websocket.accept()
        self.active_connections[user_id].add(websocket)
        logger.info(
            f"WebSocket connected for user {user_id} "
            f"(total connections: {len(self.active_connections[user_id])})"
        )

        # Send welcome message
        await websocket.send_json({
            "type": "connected",
            "service": SERVICE_NAME,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })

    def disconnect(self, user_id: str, websocket: WebSocket):
        """Remove a WebSocket connection.

        Args:
            user_id: The user ID
            websocket: The WebSocket connection to remove
        """
        self.active_connections[user_id].discard(websocket)
        if not self.active_connections[user_id]:
            del self.active_connections[user_id]
        logger.info(
            f"WebSocket disconnected for user {user_id} "
            f"(remaining: {len(self.active_connections.get(user_id, []))})"
        )

    async def broadcast_to_user(self, user_id: str, message: dict[str, Any]):
        """Broadcast a message to all connected clients for a user.

        Args:
            user_id: The user ID to broadcast to
            message: The message to send (will be JSON serialized)
        """
        if user_id not in self.active_connections:
            logger.debug(f"No active connections for user {user_id}")
            return

        # Add timestamp to message
        message["timestamp"] = datetime.now(timezone.utc).isoformat()

        # Send to all connected clients for this user
        disconnected = set()
        for connection in self.active_connections[user_id]:
            try:
                await connection.send_json(message)
                logger.debug(f"Sent message to user {user_id}: {message.get('type')}")
            except Exception as e:
                logger.error(f"Error sending to WebSocket: {e}")
                disconnected.add(connection)

        # Clean up disconnected clients
        for connection in disconnected:
            self.disconnect(user_id, connection)

    def get_connection_count(self, user_id: str) -> int:
        """Get the number of active connections for a user.

        Args:
            user_id: The user ID

        Returns:
            Number of active connections
        """
        return len(self.active_connections.get(user_id, set()))


class SSEConnectionManager:
    """Manages SSE connections per user using asyncio queues."""

    def __init__(self):
        # Map user_id -> set of asyncio.Queue for event streaming
        self.active_connections: Dict[str, Set[asyncio.Queue]] = defaultdict(set)

    def connect(self, user_id: str) -> asyncio.Queue:
        """Create a new SSE connection and return its queue.

        Args:
            user_id: The user ID for this connection

        Returns:
            asyncio.Queue for streaming events to this client
        """
        queue: asyncio.Queue = asyncio.Queue()
        self.active_connections[user_id].add(queue)
        logger.info(
            f"SSE connected for user {user_id} "
            f"(total connections: {len(self.active_connections[user_id])})"
        )
        return queue

    def disconnect(self, user_id: str, queue: asyncio.Queue):
        """Remove an SSE connection.

        Args:
            user_id: The user ID
            queue: The queue to remove
        """
        self.active_connections[user_id].discard(queue)
        if not self.active_connections[user_id]:
            del self.active_connections[user_id]
        logger.info(
            f"SSE disconnected for user {user_id} "
            f"(remaining: {len(self.active_connections.get(user_id, []))})"
        )

    async def broadcast_to_user(self, user_id: str, message: dict[str, Any]):
        """Broadcast a message to all SSE connections for a user.

        Args:
            user_id: The user ID to broadcast to
            message: The message to send (will be JSON serialized)
        """
        if user_id not in self.active_connections:
            logger.debug(f"No active SSE connections for user {user_id}")
            return 0

        # Add timestamp to message
        message["timestamp"] = datetime.now(timezone.utc).isoformat()

        # Send to all SSE connections for this user
        dead_queues = set()
        success_count = 0

        for queue in self.active_connections[user_id]:
            try:
                # Non-blocking put - skip if queue is full
                if not queue.full():
                    await queue.put(message)
                    success_count += 1
                    logger.debug(f"Sent SSE message to user {user_id}: {message.get('type')}")
                else:
                    dead_queues.add(queue)
            except Exception as e:
                logger.error(f"Error sending to SSE queue: {e}")
                dead_queues.add(queue)

        # Clean up disconnected clients
        for queue in dead_queues:
            self.disconnect(user_id, queue)

        return success_count

    def get_connection_count(self, user_id: str) -> int:
        """Get the number of active SSE connections for a user.

        Args:
            user_id: The user ID

        Returns:
            Number of active connections
        """
        return len(self.active_connections.get(user_id, set()))


# Global connection managers
manager = ConnectionManager()
sse_manager = SSEConnectionManager()


@app.get("/health")
async def health():
    """Health check endpoint."""
    ws_connections = sum(
        len(conns) for conns in manager.active_connections.values()
    )
    sse_connections = sum(
        len(conns) for conns in sse_manager.active_connections.values()
    )
    return {
        "status": "healthy",
        "service": SERVICE_NAME,
        "websocket_connections": ws_connections,
        "sse_connections": sse_connections,
        "total_connections": ws_connections + sse_connections,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time task updates.

    Query Parameters:
        user_id: Required - The user ID for this connection

    Example:
        ws://localhost:8004/ws?user_id=user_123
    """
    user_id = websocket.query_params.get("user_id")

    if not user_id:
        await websocket.close(code=1008, reason="user_id query parameter required")
        return

    await manager.connect(user_id, websocket)

    try:
        # Keep connection alive and handle incoming messages (mostly pings)
        while True:
            data = await websocket.receive_text()
            # Echo back or handle specific client messages
            logger.debug(f"Received from user {user_id}: {data}")

    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
        manager.disconnect(user_id, websocket)


@app.get("/api/sse/{user_id}")
async def sse_endpoint(user_id: str):
    """Server-Sent Events endpoint for real-time task updates.

    More stable than WebSocket over tunnels/proxies like Minikube.
    Sends real-time updates for:
    - Task created/updated/deleted/completed
    - Reminders

    Args:
        user_id: The user ID for this connection

    Example:
        http://localhost:8004/api/sse/user_123
    """
    # Create a queue for this SSE connection
    queue = sse_manager.connect(user_id)

    async def event_stream():
        """Generator that yields SSE events."""
        try:
            while True:
                # Wait for events (with timeout for keep-alive)
                try:
                    event = await asyncio.wait_for(queue.get(), timeout=15.0)
                    # Format as SSE: "data: {json}\n\n"
                    yield f"data: {json.dumps(event)}\n\n"
                except asyncio.TimeoutError:
                    # Send keep-alive comment every 15s to prevent proxy drops
                    yield ": keep-alive\n\n"
        except asyncio.CancelledError:
            # Client disconnected
            sse_manager.disconnect(user_id, queue)
            logger.info(f"SSE client disconnected for user {user_id}")
        except Exception as e:
            logger.error(f"SSE error for user {user_id}: {e}")
            sse_manager.disconnect(user_id, queue)

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
        },
    )


async def handle_task_update(event_data: dict[str, Any], action: str):
    """Handle a task update event and broadcast to connected clients.

    Args:
        event_data: Event payload from Dapr
        action: The action that occurred (created, updated, completed, deleted)
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

    # Check idempotency - skip if already processed for broadcasting
    # Note: We use a different service name for idempotency here
    # since we want to ensure each message is broadcast only once
    if await check_and_mark_processed(event_id, f"{SERVICE_NAME}-broadcast"):
        logger.debug(
            f"Event {event_id} already broadcast by {SERVICE_NAME}, skipping"
        )
        return

    # Message format for both WebSocket and SSE
    message = {
        "type": "task_update",
        "action": action,
        "data": data,
        "user_id": user_id,
    }

    # Broadcast to WebSocket connections
    ws_count = await manager.broadcast_to_user(user_id, message)

    # Broadcast to SSE connections
    sse_count = await sse_manager.broadcast_to_user(user_id, message)

    total_connections = ws_count + sse_count
    if total_connections > 0:
        logger.info(
            f"Event {action} for user {user_id} broadcast to "
            f"{ws_count} WebSocket + {sse_count} SSE connections"
        )


@app.post("/events/task-created")
async def handle_task_created(event_data: dict[str, Any]):
    """Handle task-created event and broadcast to clients."""
    await handle_task_update(event_data, "created")


@app.post("/events/task-updated")
async def handle_task_updated(event_data: dict[str, Any]):
    """Handle task-updated event and broadcast to clients."""
    await handle_task_update(event_data, "updated")


@app.post("/events/task-completed")
async def handle_task_completed(event_data: dict[str, Any]):
    """Handle task-completed event and broadcast to clients."""
    await handle_task_update(event_data, "completed")


@app.post("/events/task-deleted")
async def handle_task_deleted(event_data: dict[str, Any]):
    """Handle task-deleted event and broadcast to clients."""
    await handle_task_update(event_data, "deleted")


@app.post("/events/reminder-due")
async def handle_reminder_due(event_data: dict[str, Any]):
    """Handle reminder-due event and broadcast to clients."""
    from backend.utils.idempotency import check_and_mark_processed

    # Dapr wraps our payload in the 'data' field (CloudEvents format)
    cloud_data = event_data.get("data", {})
    if not cloud_data:
        # If not wrapped, use event_data directly (for backward compatibility)
        cloud_data = event_data

    event_id = cloud_data.get("event_id")
    user_id = cloud_data.get("user_id")
    data = cloud_data.get("data", {})

    # Check idempotency
    if await check_and_mark_processed(event_id, f"{SERVICE_NAME}-broadcast"):
        return

    # Message format for both WebSocket and SSE
    message = {
        "type": "reminder",
        "data": data,
        "user_id": user_id,
    }

    # Broadcast to WebSocket connections
    ws_count = await manager.broadcast_to_user(user_id, message)

    # Broadcast to SSE connections
    sse_count = await sse_manager.broadcast_to_user(user_id, message)

    total_connections = ws_count + sse_count
    if total_connections > 0:
        logger.info(
            f"Reminder for user {user_id} broadcast to "
            f"{ws_count} WebSocket + {sse_count} SSE connections"
        )


@app.on_event("startup")
async def startup():
    """Log service startup."""
    logger.info(f"{SERVICE_NAME} starting up on port {SERVICE_PORT}")


@app.on_event("shutdown")
async def shutdown():
    """Log service shutdown and close all connections."""
    logger.info(f"{SERVICE_NAME} shutting down")
    # Note: WebSocket connections will be closed automatically


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "websocket_service:app",
        host="0.0.0.0",
        port=SERVICE_PORT,
        reload=False,
    )
