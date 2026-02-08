# Phase 5: Microservices with Dapr

Event-driven microservices architecture with Dapr runtime, featuring real-time updates, automatic recurring tasks, reminder notifications, and complete audit trail.

---

## 🛠️ Technology Stack

### Core Technologies
- **Next.js 16+** (App Router) - Modern React framework with server components
- **Python FastAPI** - Async Python web framework for high-performance APIs
- **SQLModel** - Type-safe ORM for Python with async support
- **Neon Serverless PostgreSQL** - Cloud-native PostgreSQL database
- **Better Auth** - Complete authentication solution
- **Claude Code + Spec-Kit Plus** - Spec-driven development workflow

### Microservices Technologies 🆕
- **Dapr v1.15+** - Distributed application runtime
- **Kafka/Redpanda** - Event streaming platform
- **Redis** - Dapr state store for idempotency
- **WebSocket** - Real-time bidirectional communication
- **SSE** - Server-Sent Events for tunnel compatibility
- **Docker** - Container runtime for all services
- **Kubernetes (Minikube)** - Local Kubernetes cluster
- **Helm 3.x** - Package manager for deployments

### AI Integration
- **OpenAI ChatKit** - Complete ChatKit UI integration via CDN
- **OpenAI Agents SDK** - Dual-agent AI system (Orchestrator + UrduSpecialist)
- **MCP Protocol** - Model Context Protocol for tool integration
- **Xiaomi mimo-v2-flash** - Cost-effective AI model

---

## 🎯 Overview

This phase transforms the monolithic application into an **event-driven microservices architecture**:

**Phase 4 (Previous)**: Monolithic backend with ChatKit + Agents
**Phase 5 (Current)**: 6 microservices with Dapr + event-driven communication

### Deployment Options

| Option | Use Case | URL |
|--------|----------|-----|
| **Docker Compose** | Local development with all services | http://localhost:3000 |
| **Minikube + Dapr** | Production-like Kubernetes with Dapr sidecars | http://127.0.0.1:3000 |

### Key Features
- ✅ **6 Microservices**: frontend, backend-api, recurring-service, notification-service, audit-service, websocket-service
- ✅ **Event-Driven Architecture**: Dapr Pub/Sub with Kafka/Redpanda
- ✅ **Real-Time Updates**: WebSocket + SSE for cross-device synchronization
- ✅ **Automatic Recurring Tasks**: Next occurrence generated on completion
- ✅ **Reminder Notifications**: Cron-based checking every minute
- ✅ **Complete Audit Trail**: All events logged to audit_logs table
- ✅ **Idempotency**: Dapr State Store prevents duplicate event processing
- ✅ **Resilient Operation**: Services fail gracefully without affecting others
- ✅ **Advanced Task Features**: Recurring tasks, reminders, tags

---

## 🏗️ Microservices Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Frontend (Next.js)                              │
│                         http://127.0.0.1:3000                               │
│                    WebSocket + SSE for Real-Time Updates                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      FastAPI Backend (backend-api)                           │
│                            Port 8000                                        │
│                        ┌─────────────────────┐                              │
│                        │   ChatKit + Agents  │                              │
│                        │   JWT Authentication │                              │
│                        │   Task CRUD         │                              │
│                        └─────────────────────┘                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼ Dapr Pub/Sub (Kafka)
        ┌───────────────────────────────┼───────────────────┬───────────────┐
        │                               │                   │               │
┌───────▼──────┐    ┌─────────────────▼──────┐  ┌───────▼──────┐  ┌──────▼─────┐
│   recurring  │    │     notification       │  │    audit     │  │  websocket │
│   -service   │    │      -service          │  │   -service   │  │  -service  │
│    Port 8001 │    │      Port 8002          │  │   Port 8003  │  │  Port 8004  │
│              │    │                        │  │             │  │            │
│ Subscribes:  │    │ Cron Binding:          │  │ Subscribes:  │  │ Subscribes:│
│ task-completed│   │ @every 1m              │  │ All events  │  │ All events │
│              │    │                        │  │             │  │            │
│ Generates:   │    │ Checks:                │  │ Logs:       │  │ Broadcasts:│
│ task-created │    │ due reminders          │  │ All events  │  │ To clients │
└──────────────┘    └─────────────────────────┘  └─────────────┘  └────────────┘
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

| Topic | Publisher | Subscribers | Purpose |
|-------|-----------|-------------|---------|
| `task-created` | backend-api | audit-service, websocket-service, recurring-service | New task events |
| `task-updated` | backend-api | audit-service, websocket-service | Task modifications |
| `task-completed` | backend-api | audit-service, websocket-service, recurring-service | Task completion |
| `task-deleted` | backend-api | audit-service, websocket-service | Task deletion |
| `reminder-due` | notification-service | websocket-service | Reminder notifications |
| `task-updates` | websocket-service | frontend | Aggregated updates |

---

## 📦 Project Structure

```
phase-5/
├── backend/                          # FastAPI Microservices
│   ├── src/backend/
│   │   ├── main.py                   # Main API (port 8000)
│   │   ├── chatkit_server.py         # ChatKit integration
│   │   ├── agents.py                 # Dual-agent system
│   │   ├── routes/                   # API endpoints
│   │   ├── models/                   # SQLModel entities
│   │   ├── services/
│   │   │   └── microservices/
│   │   │       ├── recurring_service.py      # Port 8001
│   │   │       ├── notification_service.py   # Port 8002
│   │   │       ├── audit_service.py          # Port 8003
│   │   │       └── websocket_service.py      # Port 8004
│   │   ├── utils/
│   │   │   ├── event_publisher.py      # Dapr pub/sub events
│   │   │   ├── idempotency.py          # Duplicate prevention
│   │   │   └── dapr_state.py           # State management
│   │   ├── auth/                      # JWT verification
│   │   └── config.py                  # Environment config
│   ├── migrations/                    # Database migrations
│   │   ├── 001_chatkit_tables.sql
│   │   ├── 002_advanced_features.sql
│   │   └── 003_dapr_state.sql
│   ├── Dockerfile                     # Multi-service Docker build
│   ├── docker-compose.yml             # Local development
│   ├── pyproject.toml                 # UV dependencies
│   ├── .env.example                   # Environment reference
│   └── DAPR_README.md                 # Dapr setup guide 📖
│
├── frontend/                         # Next.js 16+ frontend
│   ├── src/
│   │   ├── app/                       # App Router routes
│   │   │   ├── (auth)/                # Login/Signup
│   │   │   ├── (dashboard)/           # Protected routes
│   │   │   ├── chatkit/               # ChatKit page
│   │   │   └── api/                   # API routes
│   │   ├── components/
│   │   │   ├── auth/                  # Auth components
│   │   │   ├── tasks/                 # Task components
│   │   │   ├── chat/                  # ChatKit components
│   │   │   └── ui/                    # UI primitives
│   │   ├── hooks/
│   │   │   └── useWebSocket.ts        # Real-time updates hook 🆕
│   │   └── lib/
│   │       └── websocket.ts           # WebSocket client 🆕
│   ├── Dockerfile                     # Multi-stage build
│   ├── package.json                   # Node dependencies
│   └── .env.local.example             # Environment template
│
├── k8s-dapr/                          # Dapr components for Kubernetes
│   ├── components/                    # Dapr components
│   │   ├── pubsub.yaml                # Kafka pub/sub
│   │   ├── statestore.yaml            # PostgreSQL state
│   │   ├── secrets.yaml               # Secret references
│   │   └── local/                     # Local dev variants
│   ├── bindings/                      # Dapr bindings
│   │   └── cron-binding.yaml          # Reminder cron
│   └── subscriptions/                 # Event subscriptions
│       ├── recurring-service.yaml
│       ├── audit-service.yaml
│       └── websocket-service.yaml
│
├── helm-charts/                       # Helm charts for all services
│   ├── todo-backend/                  # Main API (with Dapr)
│   ├── todo-frontend/                 # Frontend (WebSocket)
│   ├── recurring-service/             # Recurring task generator
│   ├── notification-service/          # Reminder notifications
│   ├── audit-service/                 # Audit logging
│   └── websocket-service/             # Real-time broadcasts
│
├── MINIKUBE_STARTUP_GUIDE.md          # Minikube + Dapr guide 📖
├── docker-compose.yml                # Local development stack
└── README.md                          # This file
```

---

## 🚀 Quick Start

### Option 1: Docker Compose (Local Development) 🧪

**Best for**: Quick iteration, debugging microservices locally

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

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

---

### Option 2: Minikube + Dapr (Production-Like) ☸️

**Best for**: Testing Kubernetes deployment with Dapr sidecars

**Prerequisites**:
- Docker Desktop (with WSL2)
- Minikube 1.30+
- kubectl
- Helm 3.x
- Dapr CLI

```bash
# 1. Start Minikube
minikube start
eval $(minikube docker-env)

# 2. Initialize Dapr in cluster
dapr init --kubernetes --wait

# 3. Apply Dapr components
cd phase-5
kubectl apply -f k8s-dapr/components/
kubectl apply -f k8s-dapr/bindings/
kubectl apply -f k8s-dapr/subscriptions/

# 4. Create Kubernetes secret
kubectl create secret generic app-secrets \
  --from-literal=DATABASE_URL='postgresql://user:pass@host/db?sslmode=require' \
  --from-literal=OPENAI_API_KEY='sk-proj-your-key' \
  --from-literal=XIAOMI_API_KEY='your-xiaomi-key' \
  --from-literal=PORT='8000' \
  --from-literal=HOST='0.0.0.0' \
  --from-literal=DEBUG='true'

# 5. Build images
docker build -t phase5-backend:v1 -f backend/Dockerfile backend
docker build -t todo-frontend:v1 -f frontend/Dockerfile frontend

# 6. Deploy services
cd helm-charts
helm upgrade --install backend-api ./todo-backend --set image.repository=phase5-backend --set image.tag=v1
helm upgrade --install frontend ./todo-frontend --set image.repository=todo-frontend --set image.tag=v1
helm upgrade --install recurring-service ./recurring-service
helm upgrade --install notification-service ./notification-service
helm upgrade --install audit-service ./audit-service
helm upgrade --install websocket-service ./websocket-service

# 7. Start tunnel (in NEW terminal)
minikube tunnel

# 8. Access application
# Frontend: http://127.0.0.1:3000
# Backend:  http://127.0.0.1:8000
```

**📖 Full Guide**: See **[DAPR_README.md](DAPR_README.md)** for complete instructions

---

## 🔌 Services Overview

| Service | Port | Description | Health Endpoint |
|---------|------|-------------|-----------------|
| **frontend** | 3000 | Next.js web application | http://localhost:3000 |
| **backend-api** | 8000 | Main FastAPI with ChatKit + Agents | `/health` |
| **recurring-service** | 8001 | Generates next recurring tasks | `/health` |
| **notification-service** | 8002 | Creates reminder notifications | `/health` |
| **audit-service** | 8003 | Logs all task events | `/health` |
| **websocket-service** | 8004 | Real-time WebSocket + SSE | `/health` |
| **redis** | 6379 | Dapr state store for idempotency | - |

---

## 🎨 Advanced Task Features

### Recurring Tasks
- **Rules**: daily, weekly, monthly, yearly
- **End Date**: Optional recurring_end_date
- **Automatic Generation**: Next task created on completion
- **Service**: `recurring-service` subscribes to `task-completed` events

### Reminders
- **Timezone**: PKT (UTC+5) support
- **Cron Checking**: Every minute via Dapr cron binding
- **Notifications**: Created in `notifications` table
- **Service**: `notification-service` handles cron events

### Tags
- **Format**: JSONB array for flexible tagging
- **Search**: `#tag` syntax in task search
- **Storage**: Stored in task table

---

## 📡 API Endpoints

### Main Backend API (port 8000)

**Task Management:**
- `GET /api/{user_id}/tasks` - List with filters
- `GET /api/{user_id}/tasks/{task_id}` - Get single task
- `POST /api/{user_id}/tasks` - Create task (publishes `task-created`)
- `PUT /api/{user_id}/tasks/{task_id}` - Update task (publishes `task-updated`)
- `PATCH /api/{user_id}/tasks/{task_id}/complete` - Toggle (publishes `task-completed`)
- `DELETE /api/{user_id}/tasks/{task_id}` - Delete task (publishes `task-deleted`)

**ChatKit Integration:**
- `POST /api/chatkit` - Main ChatKit endpoint
- `POST /api/chatkit/session` - Create session

**Notifications:**
- `GET /api/{user_id}/notifications` - List notifications
- `POST /api/{user_id}/notifications/{id}/read` - Mark as read
- `POST /api/{user_id}/notifications/read-all` - Mark all as read
- `DELETE /api/{user_id}/notifications/{id}` - Delete notification

**Audit:**
- `GET /api/{user_id}/audit` - Get audit logs

### Microservice Endpoints

**Recurring Service** (port 8001):
- `GET /health` - Health check
- `POST /events/task-completed` - Handle task completion

**Notification Service** (port 8002):
- `GET /health` - Health check
- `POST /cron-binding` - Dapr cron trigger
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
- `POST /events/*` - All task event subscriptions

---

## 🗄️ Database Schema

### Extended Task Table (Phase 5)

```sql
CREATE TABLE IF NOT EXISTS task (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    priority VARCHAR(10) NOT NULL,
    category VARCHAR(20) NOT NULL,
    due_date DATE,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Phase 5: Advanced Features
    recurring_rule VARCHAR(20),              -- daily, weekly, monthly, yearly
    recurring_end_date TIMESTAMPTZ,          -- Optional end date
    parent_task_id UUID,                     -- For recurring task chains
    reminder_at TIMESTAMPTZ,                 -- When to remind
    reminder_sent BOOLEAN DEFAULT FALSE,     -- Track reminder sent
    tags JSONB DEFAULT '[]'::jsonb,          -- Flexible tagging

    CONSTRAINT chk_recurring_requires_due
        CHECK (recurring_rule IS NULL OR due_date IS NOT NULL)
);
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
```

### Audit Logs Table

```sql
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    data JSONB DEFAULT '{}'
);
```

---

## 🔐 Authentication

### JWT Flow (Same as Phase 4)

1. **User Login**: Frontend uses Better Auth
2. **Token Storage**: HTTP-only cookies
3. **API Calls**: `Authorization: Bearer <token>` header
4. **Verification**: Backend verifies JWT with JWKS
5. **User Isolation**: All queries scoped to `user_id`

---

## 🧪 Troubleshooting

### Events Not Being Processed

```bash
# Check Dapr components
kubectl get components

# Check Kafka topics
kubectl exec -it redpanda-0 -- rpk topic list

# Check microservice logs
kubectl logs -l app=recurring-service --tail=50
kubectl logs -l app=audit-service --tail=50

# Check Dapr sidecar logs
kubectl logs -l app=backend-api -c daprd
```

### WebSocket Connection Issues

```bash
# Check websocket-service is running
kubectl get pods -l app=websocket-service

# Check WebSocket service endpoint
kubectl describe svc websocket-service

# Test WebSocket connection
wscat -c ws://127.0.0.1:8004/ws?user_id=test-user
```

### Idempotency Issues (Duplicate Processing)

```bash
# Check Redis state store
kubectl exec -it redis-0 -- redis-cli

# Check for processed events
KEYS processed-*

# View specific event
GET processed-event-123-recurring-service
```

---

## 📚 Documentation

### Phase 5 Documentation

**Specifications:**
- **Advanced Features**: `specs/010-features/spec.md`
- **Microservices Dapr**: `specs/011-microservices-dapr/spec.md`

**Architecture:**
- **Advanced Features Plan**: `specs/010-features/plan.md`
- **Microservices Plan**: `specs/011-microservices-dapr/plan.md`

**Implementation:**
- **Advanced Features Tasks**: `specs/010-features/tasks.md`
- **Microservices Tasks**: `specs/011-microservices-dapr/tasks.md` (100+ tasks)

**Deployment Guides:**
- **[DAPR_README.md](DAPR_README.md)** - Complete Dapr setup guide
- **[MINIKUBE_STARTUP_GUIDE.md](MINIKUBE_STARTUP_GUIDE.md)** - Minikube + Dapr instructions

**PHRs**: `history/prompts/011-microservices-dapr/` (comprehensive development history)

---

## 🎯 Current Status

**Branch**: `011-microservices-dapr` ✅ Complete
**Total Tasks**: 100+ (Phase 5 microservices)
**Overall**: 684+ tasks across all 5 phases (100% complete)

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

### Ready for Production

This event-driven microservices architecture is production-ready with:
- ✅ Resilient service communication
- ✅ At-least-once delivery guarantees
- ✅ Duplicate event prevention
- ✅ Graceful degradation
- ✅ Complete observability (audit logs)
- ✅ Container orchestration ready

---

## 🚀 Next Steps

**Ready for Phase VI: Production Cloud Deployment**

Future enhancements:
- Deploy to Azure AKS / Google GKE / Oracle OKE
- Add monitoring (Prometheus + Grafana)
- Implement service mesh (Istio)
- CI/CD pipeline with GitHub Actions
- Advanced observability (distributed tracing)

---

**Project**: Phase 5 - Microservices with Dapr
**Branch**: `011-microservices-dapr`
**Architecture**: Event-Driven Microservices + Dapr + Kafka + Redis + WebSocket + Kubernetes + Helm
**Status**: ✅ **Complete - Production-Ready**

### Complete Feature Set
- ✅ 6 Microservices with Dapr sidecars
- ✅ Event-driven architecture (6 Kafka topics)
- ✅ Real-time updates (WebSocket + SSE)
- ✅ Automatic recurring task generation
- ✅ Reminder notifications with cron
- ✅ Complete audit trail
- ✅ Idempotency guarantees
- ✅ Advanced task features (recurring, reminders, tags)
- ✅ ChatKit + Agents SDK integration
- ✅ Resilient service communication
- ✅ Docker Compose local development
- ✅ Kubernetes + Helm deployment

This application demonstrates a modern event-driven microservices architecture with real-time capabilities, AI integration, and production-ready deployment patterns.
