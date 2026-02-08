"""Microservices entry points for Dapr event-driven architecture.

This package contains standalone FastAPI applications that run as
separate microservices, each subscribing to specific Kafka topics
via Dapr sidecars.
"""

from .recurring_service import app as recurring_app
from .notification_service import app as notification_app
from .audit_service import app as audit_app
from .websocket_service import app as websocket_app

__all__ = [
    "recurring_app",
    "notification_app",
    "audit_app",
    "websocket_app",
]
