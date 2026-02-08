# Phase 5: Backend Microservices with Dapr

Event-driven microservices architecture with Dapr runtime, featuring 6 independent services, real-time updates, automatic recurring tasks, reminder notifications, and complete audit trail.

---

## 🛠️ Technology Stack

### Core Framework
- **Python 3.12+** - Modern Python with async/await support
- **FastAPI** - High-performance async web framework
- **SQLModel** - Type-safe ORM with async support
- **UV** - Modern Python package manager

### Microservices Technologies 🆕
- **Dapr v1.15+** - Distributed application runtime
- **Dapr SDK for Python** - Python integration for Dapr
- **Kafka/Redpanda** - Event streaming via Dapr Pub/Sub
- **Redis** - Dapr state store for idempotency
- **WebSocket** - Real-time bidirectional communication
- **SSE** - Server-Sent Events for tunnel compatibility

### AI Integration (from Phase 3)
- **OpenAI ChatKit** - Complete ChatKit integration
- **OpenAI Agents SDK 0.6.5+** - Multi-agent framework
- **MCP SDK 0.6.5+** - Model Context Protocol for tools
- **Xiaomi mimo-v2-flash** - Cost-effective AI model

### Data & Security
- **Neon Serverless PostgreSQL** - Cloud-native database (SSL required)
- **python-jose** - JWT token handling
- **Better Auth Integration** - JWT compatibility with frontend
- **pytest** - Async testing framework

---

## 🏗️ Microservices Architecture

### 6 Independent Services

| Service | Port | Description | Health Endpoint |
|---------|------|-------------|-----------------|
| **backend-api** | 8000 | Main API with ChatKit + Agents + Task CRUD | `/health` |
| **recurring-service** | 8001 | Generates next recurring tasks on completion | `/health` |
| **notification-service** | 8002 | Creates reminder notifications (cron-based) | `/health` |
| **audit-service** | 8003 | Logs all task events to audit trail | `/health` |
| **websocket-service** | 8004 | Real-time broadcasts (WebSocket + SSE) | `/health` |

### Event Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js + WebSocket)                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         backend-api (Port 8000)                             │
│  ┌─────────────┐ ┌──────────────┐ ┌─────────────┐ ┌─────────────────────┐ │
│  │   ChatKit   │ │    Agents    │ │   Task CRUD │ │   Event Publisher   │ │
│  │   Server    │ │    (Dual)    │ │   (User     │ │   (Dapr Pub/Sub)    │ │
│  │             │ │              │ │   Isolated) │ │                     │ │
│  └─────────────┘ └──────────────┘ └─────────────┘ └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ Dapr Pub/Sub (Kafka)
        ┌───────────────────────────┼───────────────────┬─────────────────────┐
        │                           │                   │                     │
┌───────▼──────┐    ┌─────────────────▼──────┐  ┌──────▼──────┐  ┌────────▼────────┐
│   recurring  │    │     notification        │  │    audit    │  │   websocket     │
│   -service   │    │      -service            │  │  -service  │  │   -service      │
│   Port 8001  │    │      Port 8002            │  │  Port 8003  │  │   Port 8004      │
│              │    │                          │  │            │  │                 │
│ Subscribes:  │    │ Cron Binding:            │  │ Subscribes:│  │ Subscribes:     │
│task-completed│    │ @every 1m                │  │ All events │  │ All events      │
│              │    │                          │  │            │  │                 │
│Publishes:    │    │ Checks:                  │  │ Logs:      │  │ Broadcasts:     │
│task-created  │    │ due reminders            │  │ All events │  │ WebSocket + SSE │
└──────────────┘    └──────────────────────────┘  └─────────────┘  └─────────────────┘
        │                    │                       │               │
        └────────────────────┴───────────────────────┴───────────────┘
                                        │
                                        ▼
                              ┌──────────────────┐
                              │   Neon DB +      │
                              │   Dapr State     │
                              │   (Redis)        │
                              └──────────────────┘
```

---

## 🔄 Event System (6 Kafka Topics)

| Topic | Publisher | Subscribers | Event Data |
|-------|-----------|-------------|------------|
| `task-created` | backend-api | audit-service, websocket-service, recurring-service | `{event_id, event_type, user_id, data: {task}}` |
| `task-updated` | backend-api | audit-service, websocket-service | `{event_id, event_type, user_id, data: {task}}` |
| `task-completed` | backend-api | audit-service, websocket-service, recurring-service | `{event_id, event_type, user_id, data: {task}}` |
| `task-deleted` | backend-api | audit-service, websocket-service | `{event_id, event_type, user_id, data: {task_id}}` |
| `reminder-due` | notification-service | websocket-service | `{event_id, event_type, user_id, data: {reminder}}` |
| `task-updates` | websocket-service | frontend | Aggregated for UI |

---

## 📦 Project Structure

```
phase-5/backend/
├── src/backend/
│   ├── main.py                       # Main API (port 8000)
│   ├── config.py                     # Environment configuration
│   ├── database.py                   # PostgreSQL connection
│   │
│   ├── agents.py                     # Dual-agent system (Orchestrator + UrduSpecialist)
│   ├── chatkit_server.py             # ChatKitServer implementation
│   ├── chatkit_store.py              # PostgreSQL store (14 methods)
│   │
│   ├── auth/                         # Authentication modules
│   │   └── jwt.py                    # JWT verification
│   │
│   ├── middleware/                   # Middleware components
│   │   └── auth.py                   # Authentication middleware
│   │
│   ├── models/                       # Database models
│   │   ├── task.py                   # Task entity with Phase 5 fields
│   │   ├── notification.py           # Notification entity
│   │   ├── audit_log.py              # Audit log entity
│   │   └── chatkit.py                # ChatKit models
│   │
│   ├── routes/                       # API endpoints
│   │   ├── tasks.py                  # Task CRUD with event publishing
│   │   ├── profile.py                # User profile and stats
│   │   └── notifications.py          # Notification management
│   │
│   ├── services/                     # Business logic
│   │   ├── task_service.py           # Task service with user isolation
│   │   └── microservices/            # 🆕 Microservice implementations
│   │       ├── recurring_service.py  # Port 8001 - Auto-generate recurring tasks
│   │       ├── notification_service.py # Port 8002 - Reminder notifications
│   │       ├── audit_service.py      # Port 8003 - Event logging
│   │       └── websocket_service.py  # Port 8004 - Real-time broadcasts
│   │
│   └── utils/                        # 🆕 Microservice utilities
│       ├── event_publisher.py        # Dapr pub/sub event publishing
│       ├── idempotency.py            # Duplicate prevention
│       └── dapr_state.py             # Dapr state store operations
│
├── migrations/                       # Database migrations
│   ├── 001_chatkit_tables.sql        # ChatKit tables
│   ├── 002_advanced_features.sql    # Phase 5 task fields
│   └── 003_dapr_state.sql            # Dapr state table
│
├── task_serves_mcp_tools.py          # MCP server with 5 CRUD tools
├── setup_chatkit.py                  # Setup and validation
├── docker-compose.yml                # 🆕 Local development stack
├── Dockerfile                        # Multi-service Docker build
├── pyproject.toml                    # UV dependencies (includes dapr)
├── .env.example                      # Environment template
└── DAPR_README.md                    # Dapr setup guide
```

---

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended for Local) 🧪

**Best for**: Quick iteration, debugging all services locally

```bash
cd phase-5

# Start all services with Dapr sidecars
docker-compose up -d

# Services available at:
# - Frontend:        http://localhost:3000
# - Backend API:     http://localhost:8000
# - Recurring:       http://localhost:8001
# - Notification:    http://localhost:8002
# - Audit:           http://localhost:8003
# - WebSocket:       http://localhost:8004
# - Redpanda Console: http://localhost:8082

# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend-api
docker-compose logs -f recurring-service

# Stop all services
docker-compose down
```

---

### Option 2: Minikube + Dapr (Production-Like) ☸️

**Best for**: Testing Kubernetes deployment with Dapr sidecars

```bash
# 1. Start Minikube
minikube start
eval $(minikube docker-env)

# 2. Initialize Dapr
dapr init --kubernetes --wait

# 3. Apply Dapr components
kubectl apply -f phase-5/k8s-dapr/components/
kubectl apply -f phase-5/k8s-dapr/bindings/
kubectl apply -f phase-5/k8s-dapr/subscriptions/

# 4. Create secrets
kubectl create secret generic app-secrets \
  --from-literal=DATABASE_URL='postgresql://user:pass@host/db?sslmode=require' \
  --from-literal=OPENAI_API_KEY='sk-proj-your-key' \
  --from-literal=XIAOMI_API_KEY='your-xiaomi-key' \
  --from-literal=PORT='8000' \
  --from-literal=HOST='0.0.0.0' \
  --from-literal=DEBUG='true'

# 5. Build and deploy
docker build -t phase5-backend:v1 -f backend/Dockerfile backend
helm upgrade --install backend-api helm-charts/todo-backend \
  --set image.repository=phase5-backend --set image.tag=v1
# ... deploy other services

# 6. Start tunnel (NEW terminal)
minikube tunnel
```

**📖 Full Guide**: See **[DAPR_README.md](DAPR_README.md)**

---

### Option 3: Local Development (Single Service)

**Best for**: Developing individual microservices

```bash
cd phase-5/backend

# Install dependencies
uv sync

# Create environment file
cp .env.example .env
# Edit .env with DATABASE_URL, OPENAI_API_KEY, XIAOMI_API_KEY, etc.

# Setup ChatKit tables (one-time)
python setup_chatkit.py

# Run specific service
# Main API (port 8000)
uv run uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload

# Recurring service (port 8001)
uv run uvicorn backend.services.microservices.recurring_service:app --port 8001 --reload

# Notification service (port 8002)
uv run uvicorn backend.services.microservices.notification_service:app --port 8002 --reload

# Audit service (port 8003)
uv run uvicorn backend.services.microservices.audit_service:app --port 8003 --reload

# WebSocket service (port 8004)
uv run uvicorn backend.services.microservices.websocket_service:app --port 8004 --reload
```

---

## 🔧 Environment Variables

### Required Variables

```bash
# Database (Neon PostgreSQL with SSL)
DATABASE_URL="postgresql+asyncpg://user:pass@ep-xxx.aws.neon.tech/db?sslmode=require"

# Authentication (MUST match frontend Better Auth)
BETTER_AUTH_SECRET="your-32-char-secret"

# AI Configuration
OPENAI_API_KEY="sk-proj-your-openai-key"
XIAOMI_API_KEY="your-xiaomi-mimo-api-key"

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=true

# CORS Origins
CORS_ORIGINS='["http://localhost:3000", "http://127.0.0.1:3000"]'

# 🆕 Dapr Configuration
DAPR_HOST="localhost"
DAPR_HTTP_PORT="3500"

# Timeouts
MCP_TIMEOUT=30
AGENT_TIMEOUT=60
```

### Microservice-Specific Variables

Each microservice inherits the base config but may override:
- `PORT` - Service-specific port (8001-8004)
- `DAPR_HTTP_PORT` - Dapr sidecar port (3501-3504)

---

## 📡 API Endpoints

### Main Backend API (port 8000)

**Task Management:**
- `GET /api/{user_id}/tasks` - List with filters (status, priority, category, search)
- `GET /api/{user_id}/tasks/{task_id}` - Get single task
- `POST /api/{user_id}/tasks` - Create task → publishes `task-created`
- `PUT /api/{user_id}/tasks/{task_id}` - Update task → publishes `task-updated`
- `PATCH /api/{user_id}/tasks/{task_id}/complete` - Toggle → publishes `task-completed`
- `DELETE /api/{user_id}/tasks/{task_id}` - Delete task → publishes `task-deleted`

**Notifications:**
- `GET /api/{user_id}/notifications` - List notifications
- `GET /api/{user_id}/notifications/unread-count` - Get unread count
- `POST /api/{user_id}/notifications/{id}/read` - Mark as read
- `POST /api/{user_id}/notifications/read-all` - Mark all as read
- `DELETE /api/{user_id}/notifications/{id}` - Delete notification

**Profile & Audit:**
- `GET /api/{user_id}/profile` - User info and task statistics
- `GET /api/{user_id}/audit` - Get audit logs

**ChatKit Integration:**
- `POST /api/chatkit` - Main ChatKit endpoint
- `POST /api/chatkit/session` - Create session
- `GET /api/chatkit/health` - Health check

**Agent Communication:**
- `POST /api/chat` - Chat with dual-agent system
- `GET /api/chat/health` - Agent health check

### Microservice Endpoints

**Recurring Service** (port 8001):
- `GET /health` - Health check
- `POST /events/task-completed` - Handle task completion event

**Notification Service** (port 8002):
- `GET /health` - Health check
- `POST /cron-binding` - Dapr cron trigger (every 1 minute)
- `GET /api/{user_id}/notifications` - Get notifications
- `PATCH /api/notifications/{id}` - Mark as read
- `DELETE /api/notifications/{id}` - Delete notification

**Audit Service** (port 8003):
- `GET /health` - Health check
- `GET /api/{user_id}/audit` - Get audit logs
- `POST /events/task-created` - Log task creation
- `POST /events/task-updated` - Log task update
- `POST /events/task-completed` - Log completion
- `POST /events/task-deleted` - Log deletion

**WebSocket Service** (port 8004):
- `GET /health` - Health check (with connection stats)
- `WS /ws?user_id={id}` - WebSocket endpoint
- `GET /api/sse/{user_id}` - SSE endpoint
- `POST /events/task-created` - Broadcast task creation
- `POST /events/task-updated` - Broadcast task update
- `POST /events/task-completed` - Broadcast completion
- `POST /events/task-deleted` - Broadcast deletion
- `POST /events/reminder-due` - Broadcast reminder

---

## 🎨 Advanced Task Features (Phase 5)

### Recurring Tasks

**Supported Rules**: `daily`, `weekly`, `monthly`, `yearly`

```python
# Create a recurring task
POST /api/{user_id}/tasks
{
    "title": "Team Standup",
    "description": "Daily team sync",
    "recurring_rule": "daily",
    "recurring_end_date": "2026-12-31T23:59:59Z",
    "due_date": "2026-01-15",
    "reminder_at": "2026-01-15T09:00:00Z"
}
```

**How It Works**:
1. User completes the recurring task
2. `backend-api` publishes `task-completed` event
3. `recurring-service` receives event
4. Calculates next occurrence based on `recurring_rule`
5. Creates new task with same title, description, category
6. Publishes `task-created` event for new task

### Reminders

**Timezone Support**: PKT (UTC+5)

```python
# Create task with reminder
POST /api/{user_id}/tasks
{
    "title": "Doctor Appointment",
    "due_date": "2026-01-20",
    "reminder_at": "2026-01-20T09:00:00+05:00"
}
```

**How It Works**:
1. Dapr cron binding triggers `notification-service` every minute
2. Service queries for tasks where `reminder_at <= NOW()` and `reminder_sent = FALSE`
3. Creates notification in database
4. Marks `reminder_sent = TRUE`
5. Publishes `reminder-due` event
6. `websocket-service` broadcasts to connected clients

### Tags

**Flexible Tagging** with JSONB:

```python
# Create task with tags
POST /api/{user_id}/tasks
{
    "title": "Project Review",
    "tags": ["urgent", "frontend", "sprint-23"]
}

# Search by tags
GET /api/{user_id}/tasks?search=#urgent
```

---

## 🗄️ Database Schema

### Extended Task Table (Phase 5)

```sql
CREATE TABLE IF NOT EXISTS task (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    priority VARCHAR(10) NOT NULL,  -- low, medium, high
    category VARCHAR(20) NOT NULL,  -- work, personal, shopping, health, other
    due_date DATE,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Phase 5: Advanced Features
    recurring_rule VARCHAR(20),              -- 'daily', 'weekly', 'monthly', 'yearly'
    recurring_end_date TIMESTAMPTZ,          -- Optional end date for recurrence
    parent_task_id UUID,                     -- Links recurring task instances
    reminder_at TIMESTAMPTZ,                 -- When to send reminder
    reminder_sent BOOLEAN DEFAULT FALSE,     -- Track if reminder was sent
    tags JSONB DEFAULT '[]'::jsonb,          -- Flexible tag array

    CONSTRAINT chk_recurring_requires_due
        CHECK (recurring_rule IS NULL OR due_date IS NOT NULL)
);

-- Indexes for performance
CREATE INDEX idx_task_user_id ON task(user_id);
CREATE INDEX idx_task_recurring_rule ON task(recurring_rule);
CREATE INDEX idx_task_reminder_at ON task(reminder_at);
CREATE INDEX idx_task_tags ON task USING gin(tags);
CREATE INDEX idx_task_parent_task_id ON task(parent_task_id);
```

### Notifications Table

```sql
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) DEFAULT 'reminder',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    task_id UUID,  -- Optional reference to task
    FOREIGN KEY (task_id) REFERENCES task(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

### Audit Logs Table

```sql
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,  -- task_created, task_updated, etc.
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    data JSONB DEFAULT '{}'
);

CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
```

### Dapr State Table

```sql
CREATE TABLE IF NOT EXISTS state (
    key TEXT PRIMARY KEY,
    value JSONB,
    isbinary BOOLEAN DEFAULT FALSE,
    insertdate TIMESTAMP DEFAULT NOW(),
    updatedate TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_state_key_prefix ON state(key text_pattern_ops);
CREATE INDEX idx_state_updatedate ON state(updatedate);
```

---

## 🔄 Dapr Integration

### Event Publishing

**Location**: `src/backend/utils/event_publisher.py`

```python
from backend.utils.event_publisher import publish_task_created

# After creating a task
await publish_task_created(
    event_id=str(uuid4()),
    user_id=user_id,
    task_data=task.model_dump()
)
```

**Available Publishers**:
- `publish_task_created()` - Publishes to `task-created` topic
- `publish_task_updated()` - Publishes to `task-updated` topic
- `publish_task_completed()` - Publishes to `task-completed` topic
- `publish_task_deleted()` - Publishes to `task-deleted` topic
- `publish_reminder_due()` - Publishes to `reminder-due` topic

### Idempotency

**Location**: `src/backend/utils/idempotency.py`

Prevents duplicate event processing using Dapr State Store:

```python
from backend.utils.idempotency import check_and_mark_processed

# In microservice event handler
already_processed = await check_and_mark_processed(
    event_id=event_data["event_id"],
    service_name="recurring-service"
)

if already_processed:
    logger.info(f"Event {event_id} already processed, skipping")
    return
```

**Key Format**: `processed-{event_id}-{service_name}`

### State Management

**Location**: `src/backend/utils/dapr_state.py`

```python
from backend.utils.dapr_state import dapr_save_state, dapr_get_state

# Save state
await dapr_save_state(
    key=f"reminder-{task_id}",
    value={"sent": True, "timestamp": datetime.now().isoformat()}
)

# Retrieve state
state = await dapr_get_state(key=f"reminder-{task_id}")
```

---

## 🧪 Testing

### Test Scripts

```bash
# Run pytest tests
uv run pytest -v

# Test specific service
uv run pytest tests/test_recurring_service.py

# Run with coverage
uv run pytest --cov=src/backend --cov-report=html
```

### Manual Testing

```bash
# Test event publishing
curl -X POST http://localhost:8000/api/user-123/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","priority":"high"}'

# Check Kafka topics
kubectl exec -it redpanda-0 -- rpk topic list

# Consume from topic
kubectl exec -it redpanda-0 -- rpk topic consume task-created

# Test WebSocket connection
wscat -c ws://localhost:8004/ws?user_id=user-123
```

---

## 🔐 Security Features

### Authentication

- **JWT Verification**: All endpoints validate JWT with Better Auth secret
- **User Ownership**: Every query scoped to `user_id`
- **Multi-Layer Isolation**: JWT + query + service level validation

### Event Security

- **Idempotency**: Dapr State Store prevents duplicate processing
- **Event Validation**: Schema validation for all events
- **User Isolation**: All events include `user_id` for filtering

### Database Security

- **SSL Required**: Neon PostgreSQL requires SSL
- **Parameterized Queries**: SQLModel prevents SQL injection
- **Row-Level Security**: All queries include user_id filter

---

## 🔧 Troubleshooting

### Events Not Being Processed

```bash
# Check Dapr sidecar is running
docker ps | grep dapr

# Check Kafka topics exist
docker exec redpanda rpk topic list

# Check microservice logs
docker logs phase-5-recurring-service-1
docker logs phase-5-audit-service-1
```

### WebSocket Connection Issues

```bash
# Check websocket-service health
curl http://localhost:8004/health

# Test WebSocket connection
wscat -c ws://localhost:8004/ws?user_id=test-user

# Check SSE endpoint
curl http://localhost:8004/api/sse/user-123
```

### Idempotency Issues (Duplicates)

```bash
# Check Redis state store
docker exec redis redis-cli KEYS "processed-*"

# View specific event
docker exec redis redis-cli GET "processed-event-123-recurring-service"
```

---

## 📚 Documentation

### Phase 5 Documentation

- **[DAPR_README.md](DAPR_README.md)** - Complete Dapr setup guide
- **[MINIKUBE_STARTUP_GUIDE.md](../MINIKUBE_STARTUP_GUIDE.md)** - Minikube + Dapr instructions
- **[specs/011-microservices-dapr/](../../specs/011-microservices-dapr/)** - Microservices specification

### API Documentation

Once running, access:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🎯 Current Status

**Branch**: `011-microservices-dapr` ✅ Complete
**Services**: 6 microservices + Dapr sidecars
**Tasks**: 100+ (Phase 5 microservices)
**Overall**: 684+ tasks across all 5 phases

### Phase 5 Completion Summary

**Advanced Features (Branch 010):**
- ✅ Recurring tasks with automatic generation
- ✅ Time-based reminders with timezone support
- ✅ Flexible tagging system
- ✅ Extended database schema

**Microservices Architecture (Branch 011):**
- ✅ 6 independent microservices
- ✅ Dapr sidecar integration
- ✅ Kafka/Redpanda event streaming
- ✅ Real-time WebSocket + SSE updates
- ✅ Idempotency with Dapr State Store
- ✅ Complete audit trail
- ✅ Helm charts for all services
- ✅ Docker Compose for local development

---

**Project**: Phase 5 - Microservices with Dapr
**Branch**: `011-microservices-dapr`
**Architecture**: Event-Driven Microservices + Dapr + Kafka + Redis + WebSocket + FastAPI + Python 3.12+
**Status**: ✅ **Complete - Production-Ready**
