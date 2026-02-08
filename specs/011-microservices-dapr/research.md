# Research: Event-Driven Microservices with Dapr

**Feature**: 011-microservices-dapr
**Date**: 2026-02-04
**Purpose**: Codebase analysis for microservices transformation

## Current State (Monolithic)

### Backend Architecture

**Entry Point**: `phase-5/backend/src/backend/main.py`

- Single FastAPI application (monolithic)
- Lifespan management initializes all services at startup
- Routes: tasks, profile, notifications, audit
- ChatKit endpoint: `/api/chatkit`
- Agent chat endpoint: `/api/chat`

**Direct Service Dependencies**:
```python
# Lines 67-69: Global service initialization
audit_service = AuditService(async_session_factory)
notification_service = NotificationService(async_session_factory, audit_service)
reminder_service = ReminderService(async_session_factory, notification_service)
```

### Routes Directory Structure

| File | Purpose | Direct Calls |
|------|---------|--------------|
| `routes/tasks.py` | Task CRUD endpoints | audit_service.log_event() |
| `routes/notifications.py` | Notification endpoints | AuditService, NotificationService |
| `routes/audit.py` | Audit log retrieval | AuditService |
| `routes/profile.py` | User profile | None |

### Services Directory

| File | Purpose | Dependencies |
|------|---------|--------------|
| `services/task_service.py` | Core CRUD business logic | Database only |
| `services/audit_service.py` | Audit logging | Session |
| `services/notification_service.py` | Notification management | Session, AuditService |
| `services/reminder_service.py` | Background reminder scheduler | Session, NotificationService |

**Dependency Chain**:
```
ReminderService → NotificationService → AuditService
```

### Data Models

| File | Model | Purpose |
|------|-------|---------|
| `models/task.py` | Task SQLModel | Core task entity |
| `models/notification.py` | Notification SQLModel | User notifications |
| `models/audit_log.py` | AuditLog SQLModel | Audit trail |
| `models/chatkit.py` | ChatKit models | ChatKit integration |

### Database Configuration

- **Provider**: Neon PostgreSQL
- **Driver**: asyncpg
- **Connection Pooling**: Enabled with `-pooler` hostname suffix
- **Pattern**: Session factory for async sessions

### Authentication Flow

1. **Frontend**: Better Auth signs in user → JWT token issued
2. **Frontend API Client**: Adds `Authorization: Bearer <token>` header
3. **Backend**: `get_current_user()` dependency validates JWT via JWKS
4. **Backend**: Extracts `user_id` from `sub` claim

**Implementation**: `auth/jwt.py`
- Algorithm: EdDSA (Ed25519)
- JWKS endpoint from `BETTER_AUTH_URL`

### MCP Tools (Agents Integration)

**File**: `task_serves_mcp_tools.py`

**Tools Exposed**:
- `create_task` - Create task with reminder support
- `list_tasks` - List with filtering
- `update_task` - Update existing task
- `delete_task` - Delete task
- `toggle_task` - Toggle completion

## Direct Service Calls to Replace

### Tasks Route (`routes/tasks.py`)

| Location | Current Call | Target Event |
|----------|--------------|--------------|
| Lines 167-175 | `audit_service.log_event(TASK_CREATED)` | `task-created` |
| Lines 264-275 | `audit_service.log_event(TASK_UPDATED)` | `task-updated` |
| Lines 330-337 | `audit_service.log_event(TASK_COMPLETED)` | `task-completed` |
| Lines 377-384 | `audit_service.log_event(TASK_DELETED)` | `task-deleted` |

### Services

| File | Pattern | Target |
|------|---------|--------|
| `reminder_service.py` | Direct `notification_service.create()` | Event + Dapr cron binding |
| `notification_service.py` | Direct `audit_service.log_event()` | Event subscriber |

## Existing Helm Charts

### todo-frontend
- **Type**: LoadBalancer
- **Port**: 3000
- **Environment Variables**:
  - `NEXT_PUBLIC_API_URL`
  - `BACKEND_URL`
  - `NODE_ENV`

### todo-backend
- **Type**: LoadBalancer
- **Port**: 8000
- **Environment Variables**:
  - `HOST`, `PORT`, `DEBUG`
  - `BETTER_AUTH_URL`
  - Secrets via `envFrom`

## Environment Variables Required

### Backend (from `.env`)

```
DATABASE_URL=postgresql://... (SSL required)
BETTER_AUTH_URL=http://frontend:3000/
HOST=0.0.0.0
PORT=8000
OPENAI_API_KEY=sk-...
XIAOMI_API_KEY=...
CORS_ORIGINS=http://localhost:3000
```

### New for Dapr

```
DAPR_HTTP_PORT=3500
DAPR_HOST=localhost
```

## Database Migrations

### Existing Tables

**002_phase5_features.sql**:
- `task` extensions: `recurring_rule`, `recurring_end_date`, `parent_task_id`, `reminder_at`, `reminder_sent`, `tags`
- `audit_logs`: Event type, entity, user ID, timestamp, data
- `notifications`: User ID, message, read status, task ID

## Frontend Structure

### Next.js App Structure

```
app/
├── (auth)/           # Authenticated routes
│   ├── login/page.tsx
│   └── signup/page.tsx
├── (dashboard)/      # Dashboard routes
│   ├── profile/page.tsx
│   └── tasks/page.tsx
├── api/              # API routes (proxies)
│   ├── auth/[...all]/route.ts
│   ├── chat/route.ts
│   └── chatkit/route.ts
├── chatkit/page.tsx
├── layout.tsx
└── page.tsx
```

### API Client Configuration

**File**: `lib/api/client.ts`
- Base URL from `NEXT_PUBLIC_API_URL`
- Methods: get, post, put, patch, delete

**File**: `lib/api/tasks.ts`
- `getTasks(userId, filters)`
- `getTask(userId, taskId)`
- `createTask(userId, data)`
- `updateTask(userId, taskId, data)`
- `deleteTask(userId, taskId)`
- `toggleTaskCompletion(userId, taskId)`

### React Query Hooks

**File**: `hooks/useTasks.ts`
- `useTasks` - Fetch with caching
- `useCreateTask` - Create mutation
- `useUpdateTask` - Update mutation
- `useDeleteTask` - Delete mutation
- `useToggleTask` - Toggle with optimistic updates
- `useTaskStats` - Statistics

## Technology Decisions

| Decision | Choice | Rationale | Alternatives |
|----------|--------|-----------|--------------|
| Message Broker | Redpanda | Kafka-compatible, lightweight, single-node | Kafka (complex), RabbitMQ |
| Event Streaming | Dapr Pub/Sub | Abstraction, sidecar pattern | Direct Kafka client |
| Idempotency | Dapr State Store (PostgreSQL) | Uses existing Neon DB, Dapr-native | Custom table |
| Reminder Scheduling | Dapr Cron Binding | Cloud-native, replaces asyncio | Quartz library |
| WebSocket State | In-memory Python dict | Simple, auto-reconnect on restart | Dapr State Store |
| Service Communication | Dapr Service Invocation | mTLS, service discovery | Direct HTTP |

## Key Findings

### What to Keep

- `task_service.py` - Core CRUD (unchanged)
- `models/task.py` - Task SQLModel (unchanged)
- `auth/jwt.py` - JWT validation (shared)
- `database.py` - Database connection (unchanged)
- `task_serves_mcp_tools.py` - MCP tools (unchanged)

### What to Remove/Replace

- Direct `audit_service.log_event()` calls → Event publishing
- Direct `notification_service.create()` calls → Event subscribers
- `reminder_service` polling → Dapr cron binding

### What to Create

- Event publisher utility (`utils/event_publisher.py`)
- Microservice entry points (4 services)
- Dapr component configurations
- Helm chart updates for Dapr annotations
- Frontend API routes (Dapr proxy)
- `state` table for Dapr State Store (idempotency tracking)
