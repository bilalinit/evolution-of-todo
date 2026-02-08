# Implementation Plan: Event-Driven Microservices with Dapr

**Branch**: `011-microservices-dapr` | **Date**: 2026-02-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/011-microservices-dapr/spec.md`

## Summary

Transform the monolithic todo application into an event-driven microservices architecture using Dapr runtime. The backend-api will publish events to a message broker (Redpanda) instead of making direct synchronous calls to audit, notification, and reminder services. Four new microservices (recurring-service, notification-service, audit-service, websocket-service) will subscribe to events independently, enabling real-time task synchronization, automatic recurring task generation, reminder notifications, and audit logging with at-least-once delivery guarantees.

**Technical Approach**: Keep task_service.py unchanged (core CRUD), replace direct service calls in routes with Dapr event publishing, deploy microservices with Dapr sidecars, use Redpanda as Kafka-compatible message broker, and implement idempotency tracking for duplicate event prevention.

## Technical Context

**Language/Version**: Python 3.12+ (backend), TypeScript 5+ (frontend with Next.js 16+)
**Primary Dependencies**:
- Backend: FastAPI, SQLModel, Dapr SDK, asyncpg (Neon PostgreSQL), uvicorn
- Frontend: Next.js 16, React Query, Better Auth JWT
- Infrastructure: Dapr 1.12+, Redpanda (Kafka-compatible), Docker, Kubernetes (Minikube), Helm 3+

**Storage**:
- Database: Neon Serverless PostgreSQL (SSL required, shared across all services)
- Message Broker: Redpanda (6 Kafka topics)
- State: Dapr state store (for WebSocket connection tracking)

**Testing**: pytest (backend), React Testing Library (frontend), kubectl for integration testing
**Target Platform**: Local Minikube (development), Kubernetes-ready for production

**Project Type**: Web application (backend microservices + frontend)
**Performance Goals**:
- API response < 500ms (event processing async)
- Event processing latency < 100ms at 100 events/second
- Real-time updates to clients within 2 seconds

**Constraints**:
- All services must run with Dapr sidecars in Kubernetes
- Frontend cannot access Dapr sidecar directly (browser limitation)
- Event ordering must be preserved per task (partition by user_id)
- At-least-once delivery with idempotency handling

**Scale/Scope**:
- 6 microservices total: frontend, backend-api, recurring-service, notification-service, audit-service, websocket-service
- 6 Kafka topics for event routing
- 5 Dapr building blocks: Pub/Sub, State Store, Service Invocation, Secrets, Bindings

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Compliance Status | Notes |
|-----------|-------------|-------------------|-------|
| **I. Universal Logic Decoupling** | Business logic independent of presentation layer | ✅ PASS | task_service.py remains pure; routes only publish events |
| **II. AI-Native Interoperability** | MCP tools exposed via stateless, typed, idempotent interfaces | ✅ PASS | task_serves_mcp_tools.py unchanged; still exposes MCP tools |
| **III. Strict Statelessness** | Services ephemeral; no in-memory state | ✅ PASS | All state in Neon DB or Redpanda; WebSocket connections tracked in Dapr state store |
| **IV. Event-Driven Decoupling** | Async communication via event streams for advanced features | ✅ PASS | Audit, notifications, reminders now event-driven via Dapr Pub/Sub |
| **V. Zero-Trust Multi-Tenancy** | All queries scoped to authenticated user_id | ✅ PASS | JWT validation on all services; events carry user_id context |

**Technology Stack Integrity**:
- ✅ Python 3.12+ (backend with FastAPI)
- ✅ Next.js 16+ (frontend)
- ✅ Neon Serverless PostgreSQL (database)
- ✅ OpenAI Agents SDK (unchanged for MCP tools)
- ✅ Dapr + Kafka (new: infrastructure for event-driven architecture)

**Gate Result**: ✅ **ALL PASSED** - Proceed with implementation

## Project Structure

### Documentation (this feature)

```text
specs/011-microservices-dapr/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output (codebase analysis)
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── events.yaml      # Event schemas
│   └── api-openapi.yaml # API contracts
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
phase-5/
├── backend/
│   ├── Dockerfile               # Multi-entrypoint Dockerfile (NEW)
│   ├── .dockerignore
│   ├── pyproject.toml
│   ├── .env
│   └── src/backend/
│       ├── main.py              # Backend API entry (MODIFY: remove direct service calls)
│       ├── database.py          # Database connection (unchanged)
│       ├── models/
│       │   ├── task.py          # Task SQLModel (unchanged)
│       │   ├── notification.py  # Notification SQLModel (unchanged)
│       │   ├── audit_log.py     # AuditLog SQLModel (unchanged)
│       │   └── processed_event.py  # NEW: Idempotency tracking
│       ├── services/
│       │   ├── task_service.py  # ✅ KEEP: Core CRUD unchanged
│       │   └── microservices/   # NEW: Microservice entry points
│       │       ├── __init__.py
│       │       ├── recurring_service.py      # Subscribe: task-completed
│       │       ├── notification_service.py   # Subscribe: reminder-due
│       │       ├── audit_service.py          # Subscribe: all task events
│       │       └── websocket_service.py      # Subscribe: task-updates
│       ├── routes/
│       │   ├── tasks.py         # MODIFY: Replace direct calls with events
│       │   ├── notifications.py # MODIFY: Move to microservice
│       │   ├── audit.py         # MODIFY: Move to microservice
│       │   └── profile.py       # unchanged
│       ├── utils/
│       │   └── event_publisher.py  # NEW: Dapr event publishing helper
│       └── auth/
│           └── jwt.py           # JWT validation (shared by all services)
│
├── frontend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   ├── .env.local
│   └── src/
│       ├── app/
│       │   ├── (dashboard)/
│       │   ├── api/
│       │   │   ├── auth/[...all]/route.ts  # Better Auth (unchanged)
│       │   │   ├── chat/route.ts           # Agent chat (unchanged)
│       │   │   ├── chatkit/route.ts        # ChatKit (unchanged)
│       │   │   ├── tasks/route.ts          # NEW: Dapr proxy to backend
│       │   │   ├── tasks/[id]/route.ts     # NEW: Dapr proxy to backend
│       │   │   ├── notifications/route.ts   # NEW: Dapr proxy to notification-service
│       │   │   └── notifications/[id]/route.ts  # NEW: Dapr proxy
│       │   ├── layout.tsx
│       │   └── page.tsx
│       └── lib/
│           ├── api/
│           │   ├── client.ts      # API client (unchanged)
│           │   └── tasks.ts       # Task API functions (unchanged)
│           └── hooks/
│               └── useTasks.ts    # React Query hooks (unchanged)
│
├── helm-charts/                    # EXISTING: Update with Dapr
│   ├── todo-frontend/              # MODIFY: Add Dapr annotations
│   │   ├── Chart.yaml
│   │   ├── values.yaml             # ADD: dapr.enabled, dapr.appId
│   │   └── templates/
│   │       └── deployment.yaml     # ADD: Dapr annotations
│   └── todo-backend/               # MODIFY: Add Dapr annotations
│       ├── Chart.yaml
│       ├── values.yaml             # ADD: dapr config
│       └── templates/
│           └── deployment.yaml     # ADD: Dapr annotations
│
├── k8s-dapr/                       # NEW: Dapr components
│   ├── components/
│   │   ├── pubsub.yaml             # Redpanda Kafka pubsub
│   │   ├── statestore.yaml         # Dapr state store for WebSocket tracking
│   │   └── secrets.yaml            # Reference to Kubernetes secrets
│   └── bindings/
│       └── cron-binding.yaml       # Cron binding for reminder checking
│
└── docker-compose.yml              # NEW: Local testing without Minikube
```

**Structure Decision**: Web application with backend microservices and frontend. The backend uses a single Docker image with multiple entrypoints (via CMD override in Helm) to deploy 5 different services (backend-api, recurring-service, notification-service, audit-service, websocket-service) from the same codebase. This reduces duplication and ensures all services share the same models, database configuration, and authentication logic.

## Complexity Tracking

> No constitution violations - this section not needed

## Phase 0: Research & Codebase Analysis

### Research Findings Summary

**Current State (Monolithic)**:
- Single FastAPI application in `phase-5/backend/src/backend/main.py`
- Direct synchronous service calls from routes to audit_service, notification_service, reminder_service
- Services initialized at startup with dependency injection
- Routes in `routes/tasks.py` call services directly after database operations

**Direct Service Calls to Replace**:

| File | Lines | Current Call | Target Event |
|------|-------|--------------|--------------|
| `routes/tasks.py:167-175` | POST /tasks | `audit_service.log_event(TASK_CREATED)` | `task-created` |
| `routes/tasks.py:264-275` | PUT /tasks/{id} | `audit_service.log_event(TASK_UPDATED)` | `task-updated` |
| `routes/tasks.py:330-337` | PATCH /tasks/{id}/complete | `audit_service.log_event(TASK_COMPLETED)` | `task-completed` |
| `routes/tasks.py:377-384` | DELETE /tasks/{id} | `audit_service.log_event(TASK_DELETED)` | `task-deleted` |
| `services/reminder_service.py` | Background | `notification_service.create()` | `reminder-due` |

**Existing Helm Charts**:
- `helm-charts/todo-frontend/`: LoadBalancer service, port 3000
- `helm-charts/todo-backend/`: LoadBalancer service, port 8000
- Both use Kubernetes Secrets for sensitive environment variables

**Authentication Flow**:
- Better Auth (frontend) issues JWT tokens
- Frontend API client adds `Authorization: Bearer <token>` header
- Backend validates JWT via JWKS endpoint (`get_current_user()` dependency)
- `user_id` extracted from `sub` claim

**Environment Variables Required**:
```
# Backend (from .env)
DATABASE_URL=postgresql://... (SSL required)
BETTER_AUTH_URL=http://frontend:3000/
HOST=0.0.0.0
PORT=8000
OPENAI_API_KEY=sk-...
XIAOMI_API_KEY=...
CORS_ORIGINS=http://localhost:3000

# New for Dapr
DAPR_HTTP_PORT=3500
DAPR_HOST=localhost
```

### Technology Decisions

| Decision | Choice | Rationale | Alternatives Considered |
|----------|--------|-----------|-------------------------|
| Message Broker | Redpanda | Kafka-compatible, lightweight, single-node deployment for local | Kafka (complex), RabbitMQ (not Kafka-compatible) |
| Event Streaming | Dapr Pub/Sub | Abstraction layer, sidecar pattern, language-agnostic | Direct Kafka client (more complex) |
| Idempotency | Dapr State Store (PostgreSQL) | Uses existing Neon DB, Dapr-native, reusable key-value store | Custom processed_events table (more code) |
| Reminder Scheduling | Dapr Cron Binding | Replaces asyncio polling, cloud-native | Quartz library (not microservices-friendly) |
| WebSocket State | In-memory Python dict | Simple, no external dependency, auto-reconnect on restart | Dapr State Store (overkill for this use case) |
| Service Communication | Dapr Service Invocation | mTLS, service discovery, resiliency | Direct HTTP (no built-in security) |

## Phase 1: Design & Contracts

### 1.1 Event Schema Definitions

**File**: `specs/011-microservices-dapr/contracts/events.yaml`

```yaml
events:
  task-created:
    topic: task-created
    partition_key: user_id
    schema:
      event_id: string (UUID)
      event_type: "task-created"
      timestamp: string (ISO8601)
      user_id: string
      data:
        task_id: string (UUID)
        title: string
        description: string (optional)
        priority: string (low/medium/high)
        due_date: string (ISO8601, optional)
        reminder_at: string (ISO8601, optional)
        recurring_rule: string (daily/weekly/monthly, optional)
        tags: array[string]

  task-updated:
    topic: task-updated
    partition_key: user_id
    schema:
      event_id: string (UUID)
      event_type: "task-updated"
      timestamp: string (ISO8601)
      user_id: string
      data:
        task_id: string (UUID)
        before: object
        after: object

  task-completed:
    topic: task-completed
    partition_key: user_id
    schema:
      event_id: string (UUID)
      event_type: "task-completed"
      timestamp: string (ISO8601)
      user_id: string
      data:
        task_id: string (UUID)
        recurring_rule: string (optional)
        recurring_end_date: string (ISO8601, optional)

  task-deleted:
    topic: task-deleted
    partition_key: user_id
    schema:
      event_id: string (UUID)
      event_type: "task-deleted"
      timestamp: string (ISO8601)
      user_id: string
      data:
        task_id: string (UUID)
        title: string

  reminder-due:
    topic: reminder-due
    partition_key: user_id
    schema:
      event_id: string (UUID)
      event_type: "reminder-due"
      timestamp: string (ISO8601)
      user_id: string
      data:
        task_id: string (UUID)
        title: string
        due_date: string (ISO8601)
        reminder_at: string (ISO8601)

  task-updates:
    topic: task-updates
    partition_key: user_id
    schema:
      event_id: string (UUID)
      event_type: "task-updates"
      timestamp: string (ISO8601)
      user_id: string
      data:
        task_id: string (UUID)
        action: string (created/updated/completed/deleted)
```

### 1.2 Service Contracts

**backend-api** (Port 8000):
- Publishes: `task-created`, `task-updated`, `task-completed`, `task-deleted`
- Subscribes: None (event publisher only)
- API: `/health`, `/api/{user_id}/tasks/*`, `/api/chat`, `/api/chatkit`

**recurring-service** (Port 8001):
- Subscribes: `task-completed`
- Publishes: `task-created` (next occurrence)
- Logic: When recurring task completed, create next occurrence

**notification-service** (Port 8002):
- Subscribes: `reminder-due` (via Dapr cron binding)
- Publishes: None
- Logic: Query tasks with `reminder_at <= NOW()` and `reminder_sent = false`, create notifications, mark `reminder_sent = true`

**audit-service** (Port 8003):
- Subscribes: `task-created`, `task-updated`, `task-completed`, `task-deleted`
- Publishes: None
- Logic: Log all events to `audit_logs` table

**websocket-service** (Port 8004):
- Subscribes: All task events
- Publishes: `task-updates` (aggregated)
- Logic: Maintain WebSocket connections, broadcast to connected clients

### 1.3 Data Model

**New Table: Dapr State (Generic State Store)**

```sql
-- File: migrations/003_dapr_state.sql
CREATE TABLE IF NOT EXISTS state (
    key TEXT PRIMARY KEY,
    value JSONB,
    isbinary BOOLEAN DEFAULT FALSE,
    insertdate TIMESTAMP DEFAULT NOW(),
    updatedate TIMESTAMP DEFAULT NOW()
);
```

> [!IMPORTANT]
> Do NOT create a `processed_events` table. Idempotency is handled via Dapr State Store using utilities in `utils/dapr_state.py` and `utils/idempotency.py`.

**Existing Tables (unchanged)**:
- `task`: Core task data (from 002_phase5_features.sql)
- `notifications`: User notifications
- `audit_logs`: Audit trail

### 1.4 Frontend API Routes (Dapr Proxy)

**New Routes**:
- `src/app/api/tasks/route.ts` - GET/POST → Dapr → backend-api
- `src/app/api/tasks/[id]/route.ts` - GET/PATCH/DELETE → Dapr → backend-api
- `src/app/api/notifications/route.ts` - GET → Dapr → notification-service
- `src/app/api/notifications/[id]/route.ts` - PATCH/DELETE → Dapr → notification-service

**Pattern**:
```typescript
// Next.js API route (server-side)
const DAPR_HOST = process.env.DAPR_HOST || 'localhost';
const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT || '3500';
const TARGET_APP = 'backend-api';  // or notification-service

const response = await fetch(
  `http://${DAPR_HOST}:${DAPR_HTTP_PORT}/v1.0/invoke/${TARGET_APP}/method/api/tasks`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': userId,
      // Forward auth cookie
    },
    body: JSON.stringify(taskData)
  }
);
```

## Phase 2-12: Implementation Steps

### Phase 2: Infrastructure Setup

**Prerequisites**: Minikube running, Docker configured

**Steps**:
1. Start Minikube: `minikube start`
2. Configure Docker: `eval $(minikube docker-env)`
3. Install Dapr: `dapr init -k`
4. Deploy Redpanda:
   ```bash
   helm repo add redpanda https://charts.redpanda.com
   helm install redpanda redpanda/redpanda \
     --set resources.cpu.cores=1 \
     --set resources.memory.container.max=1Gi
   ```
5. Create Kafka topics:
   ```bash
   kubectl exec -it redpanda-0 -- rpk topic create \
     task-created task-completed task-updated task-deleted reminder-due task-updates
   ```

**Verification**:
```bash
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=redpanda --timeout=300s
kubectl exec -it redpanda-0 -- rpk topic list
```

### Phase 3: Create Dapr Components

**Files to Create**:

`k8s-dapr/components/pubsub.yaml`:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
spec:
  type: pubsub.kafka
  version: v1
  metadata:
    - name: brokers
      value: "redpanda:9093"
    - name: authRequired
      value: "false"
    - name: consumerID
      value: "{{ .Values.dapr.appId }}"
```

`k8s-dapr/components/statestore.yaml`:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.postgresql
  version: v1
  metadata:
    - name: connectionString
      secretKeyRef:
        name: app-secrets
        key: DATABASE_URL
```

`k8s-dapr/bindings/cron-binding.yaml`:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: reminder-cron
spec:
  type: bindings.cron
  version: v1
  metadata:
    - name: schedule
      value: "@every 1m"
```

**Apply**:
```bash
kubectl apply -f k8s-dapr/components/
kubectl apply -f k8s-dapr/bindings/
```

### Phase 4: Create Event Publisher Utility

**File**: `backend/src/backend/utils/event_publisher.py`

```python
import httpx
import os
from typing import Any, Dict
import uuid

DAPR_HOST = os.getenv("DAPR_HOST", "localhost")
DAPR_HTTP_PORT = os.getenv("DAPR_HTTP_PORT", "3500")

async def publish_event(
    topic: str,
    event_type: str,
    user_id: str,
    data: Dict[str, Any]
) -> str:
    """Publish event to Dapr pubsub."""
    event_id = str(uuid.uuid4())
    payload = {
        "event_id": event_id,
        "event_type": event_type,
        "timestamp": datetime.utcnow().isoformat(),
        "user_id": user_id,
        "data": data
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"http://{DAPR_HOST}:{DAPR_HTTP_PORT}/v1.0/publish/pubsub/{topic}",
            json=payload,
            params={"metadata.partitionKey": user_id}
        )
        response.raise_for_status()

    return event_id
```

### Phase 5: Create Microservices Entry Points

**File**: `backend/src/backend/services/microservices/recurring_service.py`

```python
from fastapi import FastAPI, BackgroundTasks
from dapr.ext.fastapi import DaprApp
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import async_session_factory
from ..models.task import Task
from ..models.processed_event import ProcessedEvent
from .task_service import TaskService
import httpx
import os
import json

app = FastAPI(title="Recurring Service")
dapr = DaprApp(app)
DAPR_HOST = os.getenv("DAPR_HOST", "localhost")
DAPR_HTTP_PORT = os.getenv("DAPR_HTTP_PORT", "3500")

@app.get("/health")
async def health():
    return {"status": "healthy"}

@dapr.subscribe(pubsub="pubsub", topic="task-completed")
async def handle_task_completed(event_data: dict):
    """Handle task completion - create next recurring task."""
    event_id = event_data.get("event_id")
    user_id = event_data.get("user_id")
    task_data = event_data.get("data", {})

    # Idempotency check
    async with async_session_factory() as session:
        existing = await session.get(ProcessedEvent, (event_id, "recurring-service"))
        if existing:
            return  # Already processed

        # Create next recurring task if applicable
        recurring_rule = task_data.get("recurring_rule")
        if recurring_rule:
            task_service = TaskService(session)
            next_task = await task_service.create_next_recurring(
                task_id=task_data["task_id"],
                recurring_rule=recurring_rule
            )

            # Record processing
            processed = ProcessedEvent(
                event_id=event_id,
                service_name="recurring-service"
            )
            session.add(processed)
            await session.commit()

    return {"status": "processed"}
```

**File**: `backend/src/backend/services/microservices/notification_service.py`

```python
from fastapi import FastAPI
from dapr.ext.fastapi import DaprApp
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import async_session_factory
from ..models.task import Task
from ..models.notification import Notification
from sqlalchemy import select
import httpx

app = FastAPI(title="Notification Service")
dapr = DaprApp(app)

@app.get("/health")
async def health():
    return {"status": "healthy"}

@dapr.binding("reminder-cron")
async def check_reminders(event_data: dict):
    """Cron job: Check for due reminders."""
    async with async_session_factory() as session:
        # Find tasks with due reminders
        query = select(Task).where(
            Task.reminder_at <= datetime.utcnow(),
            Task.reminder_sent == False
        )
        result = await session.execute(query)
        tasks = result.scalars().all()

        for task in tasks:
            # Create notification
            notification = Notification(
                user_id=task.user_id,
                message=f"Reminder: {task.title}",
                task_id=task.id
            )
            session.add(notification)

            # Mark reminder as sent
            task.reminder_sent = True

        await session.commit()

    return {"status": "processed"}
```

**File**: `backend/src/backend/services/microservices/audit_service.py`

```python
from fastapi import FastAPI
from dapr.ext.fastapi import DaprApp
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import async_session_factory
from ..models.audit_log import AuditLog, EventType
from ..models.processed_event import ProcessedEvent
import uuid

app = FastAPI(title="Audit Service")
dapr = DaprApp(app)

@dapr.subscribe(pubsub="pubsub", topic="task-created")
async def handle_task_created(event_data: dict):
    """Log task creation."""
    await _log_event(event_data, EventType.TASK_CREATED)

@dapr.subscribe(pubsub="pubsub", topic="task-updated")
async def handle_task_updated(event_data: dict):
    """Log task update."""
    await _log_event(event_data, EventType.TASK_UPDATED)

@dapr.subscribe(pubsub="pubsub", topic="task-completed")
async def handle_task_completed(event_data: dict):
    """Log task completion."""
    await _log_event(event_data, EventType.TASK_COMPLETED)

@dapr.subscribe(pubsub="pubsub", topic="task-deleted")
async def handle_task_deleted(event_data: dict):
    """Log task deletion."""
    await _log_event(event_data, EventType.TASK_DELETED)

async def _log_event(event_data: dict, event_type: EventType):
    event_id = event_data.get("event_id")
    async with async_session_factory() as session:
        # Idempotency check
        existing = await session.get(ProcessedEvent, (event_id, "audit-service"))
        if existing:
            return

        # Log event
        log = AuditLog(
            event_type=event_type,
            entity_type="task",
            entity_id=uuid.UUID(event_data["data"]["task_id"]),
            user_id=event_data["user_id"],
            data=event_data["data"]
        )
        session.add(log)

        # Record processing
        processed = ProcessedEvent(
            event_id=event_id,
            service_name="audit-service"
        )
        session.add(processed)
        await session.commit()
```

**File**: `backend/src/backend/services/microservices/websocket_service.py`

```python
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from dapr.ext.fastapi import DaprApp
from dapr.clients import DaprClient
from typing import Dict, Set
import json

app = FastAPI(title="WebSocket Service")
dapr = DaprApp(app)
dapr_client = DaprClient()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)

        # Store in Dapr state
        dapr_client.save_state(
            store_name="statestore",
            key=f"connection:{user_id}:{id(websocket)}",
            value={"user_id": user_id}
        )

    def disconnect(self, user_id: str, websocket: WebSocket):
        self.active_connections[user_id].remove(websocket)
        if not self.active_connections[user_id]:
            del self.active_connections[user_id]

    async def broadcast_to_user(self, user_id: str, message: dict):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                await connection.send_json(message)

manager = ConnectionManager()

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    user_id = websocket.query_params.get("user_id")
    await manager.connect(user_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)

@dapr.subscribe(pubsub="pubsub", topic="task-updates")
async def handle_task_updates(event_data: dict):
    """Broadcast task updates to connected clients."""
    user_id = event_data["user_id"]
    await manager.broadcast_to_user(user_id, {
        "type": "task_update",
        "data": event_data["data"]
    })
```

### Phase 6: Modify backend-api

**File**: `backend/src/backend/routes/tasks.py`

**Remove**:
```python
# DELETE THESE LINES (167-175, 264-275, 330-337, 377-384)
audit_service = AuditService(session)
await audit_service.log_event(...)
```

**Add**:
```python
from ..utils.event_publisher import publish_event

# After task creation (line ~167)
await publish_event(
    topic="task-created",
    event_type="task-created",
    user_id=user_id,
    data={"task_id": str(task.id), "title": task.title, ...}
)

# After task update
await publish_event("task-updated", "task-updated", user_id, {...})

# After task completion
await publish_event("task-completed", "task-completed", user_id, {
    "task_id": str(task.id),
    "recurring_rule": task.recurring_rule,
    ...
})

# Before task deletion
await publish_event("task-deleted", "task-deleted", user_id, {...})
```

### Phase 7: Create Multi-Entrypoint Dockerfile

**File**: `backend/Dockerfile`

```dockerfile
FROM python:3.12-slim AS builder
WORKDIR /app
COPY pyproject.toml ./
RUN pip install --no-cache-dir uv && uv sync --no-dev

FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /app/.venv /app/.venv
COPY . /

# Default: backend-api
ENTRYPOINT ["/app/.venv/bin/uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]

# Override for other services:
# recurring-service: CMD ["backend.services.microservices.recurring_service:app"]
# notification-service: CMD ["backend.services.microservices.notification_service:app"]
# audit-service: CMD ["backend.services.microservices.audit_service:app"]
# websocket-service: CMD ["backend.services.microservices.websocket_service:app"]
```

### Phase 8: Create NEW Helm Charts

**For each microservice** (recurring-service, notification-service, audit-service, websocket-service):

```bash
helm create helm-charts/recurring-service
helm create helm-charts/notification-service
helm create helm-charts/audit-service
helm create helm-charts/websocket-service
```

**Key values.yaml customization** (example: recurring-service):

```yaml
replicaCount: 1

image:
  repository: phase5-backend
  tag: "v1"
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 8001

dapr:
  enabled: true
  appId: "recurring-service"
  appPort: 8001

env:
  DAPR_HOST: "localhost"
  DAPR_HTTP_PORT: "3500"
  DATABASE_URL: ""  # From secret

envFrom:
  - secretRef:
      name: app-secrets
```

**deployment.yaml template** (add Dapr annotations):

```yaml
spec:
  template:
    metadata:
      annotations:
        dapr.io/enabled: "{{ .Values.dapr.enabled }}"
        dapr.io/app-id: "{{ .Values.dapr.appId }}"
        dapr.io/app-port: "{{ .Values.dapr.appPort }}"
        dapr.io/log-level: "debug"
```

### Phase 9: UPDATE Existing Helm Charts

**File**: `helm-charts/todo-backend/values.yaml`

```yaml
dapr:
  enabled: true
  appId: "backend-api"
  appPort: 8000
```

**File**: `helm-charts/todo-frontend/values.yaml`

```yaml
dapr:
  enabled: true
  appId: "frontend"
  appPort: 3000

env:
  # Add Dapr configuration
  DAPR_HOST: "localhost"
  DAPR_HTTP_PORT: "3500"
  # Update backend URL to use service invocation
  BACKEND_URL: "http://backend-api:8000"
```

### Phase 10: Create docker-compose.yml

**File**: `phase-5/docker-compose.yml`

```yaml
version: '3.8'

services:
  redpanda:
    image: redpandadata/redpanda:v23.2.4
    command:
      - redpanda start
      - --smp 1
      - --reserve-memory 0M
      - --overprovisioned
    ports:
      - "9093:9093"

  backend-api:
    build: ./backend
    command: uvicorn backend.main:app --host 0.0.0.0 --port 8000
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - DAPR_HOST=localhost
      - DAPR_HTTP_PORT=3500
    depends_on:
      - dapr-backend-api

  dapr-backend-api:
    image: daprio/daprd:1.12.0
    command: >
      ./daprd
      -app-id backend-api
      -app-port 8000
      -dapr-http-port 3500
      -components-path /components
    volumes:
      - ./k8s-dapr/components:/components
    ports:
      - "3500:3500"
    depends_on:
      - redpanda

  recurring-service:
    build: ./backend
    command: uvicorn backend.services.microservices.recurring_service:app --host 0.0.0.0 --port 8001
    ports:
      - "8001:8001"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - DAPR_HOST=localhost
      - DAPR_HTTP_PORT=3501
    depends_on:
      - dapr-recurring-service

  dapr-recurring-service:
    image: daprio/daprd:1.12.0
    command: >
      ./daprd
      -app-id recurring-service
      -app-port 8001
      -dapr-http-port 3501
      -components-path /components
    volumes:
      - ./k8s-dapr/components:/components
    ports:
      - "3501:3501"
    depends_on:
      - redpanda

  # ... similar for notification-service, audit-service, websocket-service

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - BACKEND_URL=http://dapr-backend-api:3500/v1.0/invoke/backend-api
```

### Phase 11: Database Migration

**File**: `backend/migrations/003_dapr_state.sql`

```sql
-- Dapr State Store table for idempotency tracking
CREATE TABLE IF NOT EXISTS state (
    key TEXT PRIMARY KEY,
    value JSONB,
    isbinary BOOLEAN DEFAULT FALSE,
    insertdate TIMESTAMP DEFAULT NOW(),
    updatedate TIMESTAMP DEFAULT NOW()
);
```

**Apply migration**:
```bash
psql $DATABASE_URL -f backend/migrations/003_dapr_state.sql
```

### Phase 11b: Create Dapr State Utilities

**File**: `backend/src/backend/utils/dapr_state.py`

```python
import os
import httpx

DAPR_HTTP_PORT = os.getenv("DAPR_HTTP_PORT", "3500")
DAPR_STATE_URL = f"http://localhost:{DAPR_HTTP_PORT}/v1.0/state/statestore"

async def dapr_save_state(key: str, value: dict) -> None:
    async with httpx.AsyncClient() as client:
        await client.post(DAPR_STATE_URL, json=[{"key": key, "value": value}])

async def dapr_get_state(key: str) -> dict | None:
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{DAPR_STATE_URL}/{key}")
        if response.status_code == 200 and response.content:
            return response.json()
        return None
```

**File**: `backend/src/backend/utils/idempotency.py`

```python
from .dapr_state import dapr_save_state, dapr_get_state
from datetime import datetime

async def check_and_mark_processed(event_id: str, service_name: str) -> bool:
    """Returns True if already processed (skip), False if new (process)."""
    key = f"processed-{event_id}-{service_name}"
    
    if await dapr_get_state(key):
        return True  # Already processed
    
    await dapr_save_state(key, {"processed_at": datetime.utcnow().isoformat()})
    return False  # Not processed, continue
```

**Usage in Event Handlers**:
```python
from utils.idempotency import check_and_mark_processed

@app.post("/events/task-created")
async def handle_task_created(event: dict):
    event_id = event.get("event_id")
    
    if await check_and_mark_processed(event_id, "audit-service"):
        return {"status": "skipped", "reason": "duplicate"}
    
    # Process the event...
    return {"status": "processed"}
```

> [!CAUTION]
> Do NOT create a `ProcessedEvent` SQLModel class. Do NOT write SELECT/INSERT SQL queries for idempotency. Use `check_and_mark_processed()` instead.

### Phase 12: Deploy All Services

```bash
# Build images in Minikube Docker
eval $(minikube docker-env)
docker build -t phase5-backend:v1 ./backend
docker build -t phase5-frontend:v1 ./frontend

# Deploy via Helm
helm install backend ./helm-charts/todo-backend
helm install frontend ./helm-charts/todo-frontend
helm install recurring-service ./helm-charts/recurring-service
helm install notification-service ./helm-charts/notification-service
helm install audit-service ./helm-charts/audit-service
helm install websocket-service ./helm-charts/websocket-service

# Verify
kubectl get pods
# Expect: 6 pods, each 2/2 (app + Dapr sidecar)

kubectl get services
# Start tunnel for external access
minikube tunnel
```

## Testing Strategy

### Phase A: Local Docker Testing

```bash
cd phase-5
docker-compose build
docker-compose up -d
docker-compose ps

# Test backend-api
curl http://localhost:8000/health
curl http://localhost:8000/api/tasks

# Test frontend
curl http://localhost:3000

# Check logs
docker-compose logs backend-api
docker-compose logs recurring-service

# Cleanup
docker-compose down
```

### Phase B: Minikube Deployment Testing

```bash
minikube start
eval $(minikube docker-env)
docker build -t phase5-backend:v1 ./backend
docker build -t phase5-frontend:v1 ./frontend

dapr init -k
kubectl apply -f k8s-dapr/components/
kubectl apply -f k8s-dapr/bindings/

# Deploy services
helm install backend ./helm-charts/todo-backend
helm install frontend ./helm-charts/todo-frontend
helm install recurring-service ./helm-charts/recurring-service
helm install notification-service ./helm-charts/notification-service
helm install audit-service ./helm-charts/audit-service
helm install websocket-service ./helm-charts/websocket-service

# Verify
kubectl get pods
kubectl get services
minikube tunnel
```

### Phase C: End-to-End Event Flow Testing

```bash
# Create task
curl -X POST http://<frontend-ip>:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title": "Test Task", "priority": "high"}'

# Verify audit log received event
kubectl logs -l app=audit-service --tail=50

# Complete recurring task
curl -X PATCH http://<frontend-ip>:3000/api/tasks/<task-id>/complete

# Verify recurring service created next task
kubectl logs -l app=recurring-service --tail=50

# Check Redpanda topics
kubectl exec -it redpanda-0 -- rpk topic consume task-created --num 1
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Kubernetes Cluster                            │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                         Dapr Sidecars                              │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │  │
│  │  │   Dapr      │ │   Dapr      │ │   Dapr      │ │   Dapr      │ │  │
│  │  │  sidecar    │ │  sidecar    │ │  sidecar    │ │  sidecar    │ │  │
│  │  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ │  │
│  │         │               │               │               │         │  │
│  │         ▼               ▼               ▼               ▼         │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │                  Redpanda (Kafka)                           │  │  │
│  │  │  task-created | task-updated | task-completed | task-deleted│  │  │
│  │  │  reminder-due | task-updates                             │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                        Application Layer                          │  │
│  │                                                                     │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │  │
│  │  │  Frontend    │  │  backend-api │  │  recurring   │             │  │
│  │  │  (Next.js)   │  │  (FastAPI)   │  │  service     │             │  │
│  │  │  Port: 3000  │  │  Port: 8000  │  │  Port: 8001  │             │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │  │
│  │         │                 │                 │                      │  │
│  │         │ API Routes      │ Publish         │ Subscribe            │  │
│  │         ▼                 ▼                 ▼                      │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │  │
│  │  │ notification │  │   audit      │  │  websocket   │             │  │
│  │  │   service    │  │   service    │  │   service    │             │  │
│  │  │  Port: 8002  │  │  Port: 8003  │  │  Port: 8004  │             │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘             │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                         Data Layer                                │  │
│  │                                                                     │  │
│  │  ┌────────────────────────────────────────────────────────────┐    │  │
│  │  │            Neon PostgreSQL (Shared)                        │    │  │
│  │  │  task | notifications | audit_logs | state (Dapr)        │    │  │
│  │  └────────────────────────────────────────────────────────────┘    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                              Browser                                    │
│                                                                         │
│  ┌──────────────┐  WebSocket  ┌──────────────────────────────────────┐  │
│  │   React UI   │ ◄──────────► │  WebSocket Service (via LoadBalancer)│  │
│  └──────┬───────┘              └──────────────────────────────────────┘  │
│         │                                                                 │
│         │ HTTP POST                                                        │
│         ▼                                                                 │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  Next.js API Routes (Server)                                         │  │
│  │  ───────────────────────────────────────────────────────────────   │  │
│  │  Forward to: http://dapr-sidecar:3500/v1.0/invoke/<service>/...    │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

## Service Reference

| Service | Port | Publishes | Subscribes | Purpose |
|---------|------|-----------|------------|---------|
| frontend | 3000 | None | None | Next.js web app |
| backend-api | 8000 | task-created, task-updated, task-completed, task-deleted | None | Core task CRUD |
| recurring-service | 8001 | task-created | task-completed | Generate next recurring tasks |
| notification-service | 8002 | None | reminder-due (cron) | Create notifications |
| audit-service | 8003 | None | all task events | Log all changes |
| websocket-service | 8004 | None | all task events | Real-time broadcasts |

## Event Flow Examples

### Creating a Task

```
User clicks "Add Task"
     ↓
Browser → POST /api/tasks (Next.js API Route)
     ↓
API Route → Dapr → backend-api
     ↓
backend-api:
  1. task_service.create_task() → Neon DB
  2. publish("task-created") → Redpanda (async)
  3. Return response immediately
     ↓
Redpanda → audit-service (subscribes to task-created)
            → websocket-service (subscribes to task-created)
     ↓
audit-service: Log to audit_logs table
websocket-service: Broadcast to user's connected clients
```

### Completing a Recurring Task

```
User completes recurring task
     ↓
backend-api: publish("task-completed")
     ↓
Redpanda → recurring-service (subscribes to task-completed)
     ↓
recurring-service:
  1. Check if task has recurring_rule
  2. Calculate next due date
  3. Create new task via task_service
  4. publish("task-created") for new task
```

### Reminder Due

```
Dapr Cron Binding (@every 1m)
     ↓
notification-service receives binding trigger
     ↓
Query: SELECT * FROM task WHERE reminder_at <= NOW() AND reminder_sent = false
     ↓
For each due task:
  1. Create notification
  2. Mark reminder_sent = true
  3. publish("reminder-due")
     ↓
websocket-service broadcasts to user's browser
```

## Risk Analysis

| Risk | Impact | Mitigation |
|------|--------|------------|
| Redpanda unavailable during deployment | High | Deploy Redpanda first, verify health before services |
| Duplicate event processing | Medium | Idempotency table with unique constraint |
| Event ordering issues | Medium | Partition by user_id in Kafka topics |
| WebSocket connection state loss | Low | Dapr state store for connection tracking |
| Service startup before dependencies ready | Medium | Kubernetes readiness probes, depends_on constraints |

## Dependencies

**External**:
- Redpanda chart: `https://charts.redpanda.com`
- Dapr CLI: `https://docs.dapr.io/getting-started/install-dapr-cli/`
- Helm 3+
- Minikube or Kubernetes cluster

**Internal**:
- Phase 5 features (recurring tasks, reminders, audit logs) must be deployed
- Better Auth JWT configuration
- Neon PostgreSQL database

## Rollback Strategy

If deployment fails:
1. `helm uninstall <service-name>` for all services
2. `helm install` previous version from branch 010
3. Delete Dapr components: `kubectl delete -f k8s-dapr/`
4. Restart services: `kubectl rollout restart deployment/<service>`

## Next Steps

After this plan is approved:
1. Run `/sp.tasks` to generate actionable tasks
2. Execute tasks in dependency order
3. Run Phase A, B, C testing sequentially
4. Create PHR for this planning session
