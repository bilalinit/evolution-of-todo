---
id: "001"
title: "Microservices Dapr Implementation Plan"
stage: "plan"
date: "2026-02-04"
surface: "agent"
model: "claude-opus-4-5-20251101"
feature: "011-microservices-dapr"
branch: "011-microservices-dapr"
user: "bilalinit"
command: "/sp.plan"
labels: ["architecture", "microservices", "dapr", "event-driven"]
links:
  spec: "specs/011-microservices-dapr/spec.md"
  ticket: "null"
  adr: "null"
  pr: "null"
files:
  - specs/011-microservices-dapr/plan.md
  - specs/011-microservices-dapr/research.md
  - specs/011-microservices-dapr/data-model.md
  - specs/011-microservices-dapr/quickstart.md
  - specs/011-microservices-dapr/contracts/events.yaml
  - specs/011-microservices-dapr/contracts/api-openapi.yaml
tests: []
---

## Prompt

Create a detailed implementation plan for Branch 011-microservices-dapr, which transforms the monolithic todo app into a true microservices architecture with Dapr event-driven communication.

## CRITICAL INSTRUCTIONS - DO THIS FIRST

Before creating ANY plan, you MUST:

1. EXAMINE existing codebase:
   - phase-5/backend/src/backend/ - Current monolithic structure
   - phase-5/backend/src/backend/models/ - Data models (Task, AuditLog, Notification)
   - phase-5/backend/src/backend/services/ - Current services (task_service.py, reminder_service.py)
   - phase-5/backend/
   - phase-5/backend/src/backend/routes/ - Current routes
   - phase-5/frontend/
   - phase-5/frontend/src/ - Frontend structure and API calls
   - phase-5/frontend/src/app/api/ - Frontend API routes
   - phase-5/helm-charts/ - EXISTING Helm charts to extend

2. READ skill: `.claude/skills/minikube-deployment/` for deployment patterns
3. VERIFY all dependencies - FastAPI structure, Next.js patterns, PostgreSQL connections, JWT auth
4. CROSS-REFERENCE - Ensure your plan matches hackathon requirements exactly

DO NOT write code. DO NOT create files. ONLY create a detailed PLAN after thorough research.

---

## ⚠️ CRITICAL ARCHITECTURE REQUIREMENT #1: Event-Driven Services

### The Problem (Current Monolith )

Backend-api calls services DIRECTLY (synchronous, blocking):

```python
# ❌ CURRENT MONOLITH PATTERN - Must be changed
async def create_task(...):
    task = task_service.create_task(...)   # Save to DB ← KEEP THIS
    audit_service.log_event(...)           # Direct call - REMOVE
    notification_service.notify(...)       # Direct call - REMOVE
    return task
```

### The Solution (Microservices - Branch 011)

Backend-api publishes EVENTS, other services consume them INDEPENDENTLY:

```python
# ✅ NEW MICROSERVICES PATTERN
async def create_task(...):
    task = task_service.create_task(...)   # Save to DB ← KEEP
    await dapr_publish("task-created", task_data)  # Non-blocking event ← ADD
    return task  # Returns IMMEDIATELY
```

### What to Keep vs Remove in backend-api

| Service | Action | Reason |
|---------|--------|--------|
| `task_service.py` | ✅ **KEEP** | Core CRUD operations for tasks |
| `audit_service.py` calls | ❌ REMOVE | Replace with event publishing |
| `notification_service.py` calls | ❌ REMOVE | Replace with event publishing |
| `reminder_service.py` polling | ❌ REMOVE | Replace with Dapr cron binding |
| `task_serves_mcp_tools.py` | ✅ **KEEP** | MCP tools stay unchanged |

---

## ⚠️ CRITICAL ARCHITECTURE REQUIREMENT #2: Frontend Communication

Browsers CANNOT access Dapr sidecar directly (localhost:3500 is server-only).

```
Browser → Next.js API Route (Server) → Dapr Sidecar → Backend Service
```

---

## ⚠️ CRITICAL ARCHITECTURE REQUIREMENT #3: Helm Charts Structure

```
phase-5/
├── helm-charts/                    ← EXISTING folder
│   ├── todo-frontend/              ← UPDATE: add Dapr annotations
│   ├── todo-backend/               ← UPDATE: add Dapr annotations
│   ├── recurring-service/          ← NEW
│   ├── notification-service/       ← NEW
│   ├── audit-service/              ← NEW
│   └── websocket-service/          ← NEW
│
└── k8s-dapr/                       ← NEW folder
    ├── components/
    │   ├── pubsub.yaml             ← Points to Redpanda
    │   ├── statestore.yaml
    │   └── secrets.yaml
    ├── subscriptions/
    └── bindings/
        └── cron-binding.yaml
```

### Helm Chart Dapr Annotations

Each `deployment.yaml` template needs:
```yaml
spec:
  template:
    metadata:
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "{{ .Values.dapr.appId }}"
        dapr.io/app-port: "{{ .Values.dapr.appPort }}"
```

---

## SCOPE

### What to BUILD:

**6 Microservices:**
- frontend (3000), backend-api (8000)
- recurring-service (8001), notification-service (8002)
- audit-service (8003), websocket-service (8004)

**Infrastructure:**
- Redpanda (local Kafka replacement)
- Dapr sidecars on all pods
- 6 Kafka topics

**6 Kafka Topics:**
- task-created, task-completed, task-updated, task-deleted
- reminder-due, task-updates

**5 Dapr Building Blocks:**
- Pub/Sub, State Store, Service Invocation, Secrets, Bindings

---

### What is OUT OF SCOPE:

- ❌ Oracle OKE / Cloud deployment (branch 012)
- ❌ GitHub Actions CI/CD (branch 012)

---

## ARCHITECTURAL DECISIONS (Already Made)

| # | Question | Decision |
|---|----------|----------|
| 1 | Database | Single shared Neon PostgreSQL |
| 2 | Reminder | Dapr Cron Binding replaces asyncio |
| 3 | Auth | Shared auth/ folder |
| 4 | Frontend | API Routes → Dapr → Backend |
| 5 | Event Ordering | Partition by user_id |
| 6 | Failure Handling | Dapr retry + idempotency table |
| 7 | Deployment | Helm charts, NOT raw K8s YAML |
| 8 | Message Broker | Redpanda (Kafka-compatible) |

---

## IMPLEMENTATION PHASES (Correct Order)

### Phase 1: Infrastructure Setup (MUST DO FIRST)

```bash
# 1.1 Start Minikube
minikube start

# 1.2 Configure Docker to use Minikube
eval $(minikube docker-env)

# 1.3 Install Dapr
dapr init -k

# 1.4 Deploy Redpanda
helm repo add redpanda https://charts.redpanda.com
helm install redpanda redpanda/redpanda \
  --set resources.cpu.cores=1 \
  --set resources.memory.container.max=1Gi

# 1.5 Wait for Redpanda to be ready
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=redpanda --timeout=300s

# 1.6 Create Kafka Topics
kubectl exec -it redpanda-0 -- rpk topic create \
  task-created \
  task-completed \
  task-updated \
  task-deleted \
  reminder-due \
  task-updates

# 1.7 Verify topics
kubectl exec -it redpanda-0 -- rpk topic list
```

### Phase 2: Create Dapr Components

Create `k8s-dapr/components/pubsub.yaml`:
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
```

Apply:
```bash
kubectl apply -f k8s-dapr/components/
kubectl apply -f k8s-dapr/bindings/
```

### Phase 3: Create Event Publisher Utility

Create `backend/src/backend/utils/event_publisher.py`:
- Helper function to publish events via Dapr HTTP API
- Call from routers/tasks.py after CRUD operations

### Phase 4: Create Microservices Entry Points

Create 4 new FastAPI apps:
- `microservices/recurring_service.py` - Subscribes to task-completed
- `microservices/notification_service.py` - Subscribes to reminder-due
- `microservices/audit_service.py` - Subscribes to all task events
- `microservices/websocket_service.py` - Subscribes to task-updates

### Phase 5: Modify backend-api

1. REMOVE direct service calls from routes/tasks.py
2. ADD event publishing after each CRUD operation
3. KEEP task_service.py unchanged

### Phase 6: Create Dockerfile (One Image Pattern)

Create `backend/Dockerfile` with multiple entrypoints:
```dockerfile
# Default: backend-api
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]

# Override for other services via Helm values
```

### Phase 7: Create NEW Helm Charts

For each microservice (recurring, notification, audit, websocket):
- Chart.yaml
- values.yaml (with Dapr config)
- templates/deployment.yaml (with Dapr annotations)

### Phase 8: UPDATE Existing Helm Charts

Add to todo-frontend/ and todo-backend/ charts:
```yaml
# values.yaml
dapr:
  enabled: true
  appId: "backend-api"
  appPort: 8000
```

### Phase 9: Create docker-compose.yml

For local testing without Minikube:
- backend-api + Dapr sidecar
- All microservices + Dapr sidecars
- Redpanda container
- Frontend

### Phase 10: Create Frontend API Routes (Dapr Proxy)

Create new API routes to proxy requests via Dapr sidecar:
- `src/app/api/tasks/route.ts` [NEW] (GET/POST → Dapr → backend-api)
- `src/app/api/tasks/[id]/route.ts` [NEW] (GET/PATCH/DELETE → Dapr → backend-api)
- `src/app/api/notifications/route.ts` [NEW] (GET → Dapr → notification-service)
- `src/app/api/notifications/[id]/route.ts` [NEW] (PATCH/DELETE → Dapr → notification-service)

### Phase 11: Database Migration

Create `processed_events` table for idempotency:
```sql
CREATE TABLE processed_events (
    id UUID PRIMARY KEY,
    event_id VARCHAR(255) NOT NULL,
    service_name VARCHAR(50) NOT NULL,
    processed_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(event_id, service_name)
);
```

### Phase 12: Deploy All Services

```bash
# Build images
docker build -t phase5-backend:v1 ./backend
docker build -t phase5-frontend:v1 ./frontend

# Deploy via Helm
helm install backend ./helm-charts/todo-backend
helm install frontend ./helm-charts/todo-frontend
helm install recurring-service ./helm-charts/recurring-service
helm install notification-service ./helm-charts/notification-service
helm install audit-service ./helm-charts/audit-service
helm install websocket-service ./helm-charts/websocket-service
```

---

## ⚠️ CRITICAL: TESTING SECTION

After implementation, the agent MUST verify everything works. Follow these steps:

### Phase A: Local Docker Testing

```bash
# 1. Build all images
docker-compose build

# 2. Start all services
docker-compose up -d

# 3. Wait for services to be healthy
docker-compose ps

# 4. Test backend-api directly
curl http://localhost:8000/health
curl http://localhost:8000/api/tasks

# 5. Test frontend
curl http://localhost:3000

# 6. Check logs for errors
docker-compose logs backend-api
docker-compose logs recurring-service
docker-compose logs notification-service
docker-compose logs audit-service
docker-compose logs websocket-service

# 7. Cleanup
docker-compose down
```

### Phase B: Minikube Deployment Testing

```bash
# 1. Start Minikube
minikube start

# 2. CRITICAL: Configure Docker to use Minikube
eval $(minikube docker-env)

# 3. Build images in Minikube
docker build -t phase5-backend:v1 ./backend
docker build -t phase5-frontend:v1 ./frontend

# 4. Install Dapr
dapr init -k

# 5. Apply Dapr components
kubectl apply -f k8s-dapr/components/
kubectl apply -f k8s-dapr/bindings/

# 6. Deploy Redpanda (local Kafka)
helm repo add redpanda https://charts.redpanda.com
helm install redpanda redpanda/redpanda --set resources.cpu.cores=1

# 7. Create topics
kubectl exec -it redpanda-0 -- rpk topic create task-created task-completed task-updated task-deleted reminder-due task-updates

# 8. Deploy services via Helm
helm install backend ./helm-charts/todo-backend
helm install frontend ./helm-charts/todo-frontend
helm install recurring-service ./helm-charts/recurring-service
helm install notification-service ./helm-charts/notification-service
helm install audit-service ./helm-charts/audit-service
helm install websocket-service ./helm-charts/websocket-service

# 9. Verify pods are running
kubectl get pods
# All pods should show "Running" and "2/2" (app + Dapr sidecar)

# 10. Verify services
kubectl get services

# 11. Start tunnel for LoadBalancer access
minikube tunnel

# 12. Get frontend external IP
kubectl get svc frontend
# Access: http://<EXTERNAL-IP>:3000
```

### Phase C: End-to-End Event Flow Testing

```bash
# 1. Create a task via API
curl -X POST http://<frontend-ip>:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title": "Test Task", "priority": "high"}'

# 2. Verify audit log received the event
kubectl logs -l app=audit-service --tail=50
# Should see: "Received task-created event"

# 3. Verify websocket service received the event
kubectl logs -l app=websocket-service --tail=50
# Should see: "Broadcasting task-created to clients"

# 4. Complete a recurring task
curl -X PATCH http://<frontend-ip>:3000/api/tasks/<task-id>/complete

# 5. Verify recurring service created next task
kubectl logs -l app=recurring-service --tail=50
# Should see: "Created next recurring task"

# 6. Check Redpanda topics have messages
kubectl exec -it redpanda-0 -- rpk topic consume task-created --num 1
```

### Phase D: Troubleshooting Commands

```bash
# Check pod details (for startup errors)
kubectl describe pod <pod-name>

# Check pod logs
kubectl logs <pod-name>
kubectl logs <pod-name> -c daprd  # Dapr sidecar logs

# Check Dapr components
kubectl get components

# Check Dapr subscriptions
kubectl get subscriptions

# Restart a deployment
kubectl rollout restart deployment/<service-name>

# Delete and reinstall a Helm release
helm uninstall <service-name>
helm install <service-name> ./helm-charts/<service-name>

# Check service endpoints
kubectl get endpoints

# Port forward for debugging
kubectl port-forward svc/backend 8000:8000

# Dapr dashboard
dapr dashboard -k
```

### Expected Results

| Check | Expected |
|-------|----------|
| All pods running | 6 pods, each with 2/2 containers (app + Dapr) |
| Create task | Returns 201, audit log shows event |
| Complete recurring task | Next task created automatically |
| Reminder at due time | Notification created, websocket broadcasts |
| Frontend loads | Shows task list from backend |
| No direct service calls | backend-api only publishes events |

---

## EVENT FLOW EXAMPLES

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
  2. publish("task-created") → Redpanda
  3. Return response
     ↓
Redpanda → audit-service, websocket-service
```

### Reminder Triggered

```
Dapr Cron Binding (@every 1m)
     ↓
notification-service: query tasks WHERE reminder_at <= NOW()
     ↓
Creates notification, marks reminder_sent = true
     ↓
publish("reminder-due") → websocket-service → User's browser
```

---

## SERVICE REFERENCE

| Service | Port | Publishes | Subscribes |
|---------|------|-----------|------------|
| frontend | 3000 | None | None |
| backend-api | 8000 | task-created, task-completed, task-updated, task-deleted | None |
| recurring-service | 8001 | task-created | task-completed |
| notification-service | 8002 | None | reminder-due |
| audit-service | 8003 | None | all task events |
| websocket-service | 8004 | None | task-updates + all |

---

## FILES TO CREATE

```
Backend:
├── Dockerfile
├── src/backend/
│   ├── utils/event_publisher.py
│   └── microservices/
│       ├── __init__.py
│       ├── recurring_service.py
│       ├── notification_service.py
│       ├── audit_service.py
│       └── websocket_service.py

Helm Charts (NEW):
├── helm-charts/recurring-service/
├── helm-charts/notification-service/
├── helm-charts/audit-service/
└── helm-charts/websocket-service/

Dapr:
└── k8s-dapr/
    ├── components/
    │   ├── pubsub.yaml
    │   ├── statestore.yaml
    │   └── secrets.yaml
    └── bindings/
        └── cron-binding.yaml

Local:
└── docker-compose.yml

Frontend (NEW - Dapr Proxy Routes):
├── src/app/api/tasks/route.ts
├── src/app/api/tasks/[id]/route.ts
├── src/app/api/notifications/route.ts
└── src/app/api/notifications/[id]/route.ts
```

## FILES TO MODIFY

```
Backend:
├── routes/tasks.py  (remove direct calls, add event publishing)
└── (task_service.py stays unchanged)

Helm Charts:
├── helm-charts/todo-frontend/values.yaml (add Dapr config)
├── helm-charts/todo-frontend/templates/deployment.yaml (add Dapr annotations)
├── helm-charts/todo-backend/values.yaml (add Dapr config)
└── helm-charts/todo-backend/templates/deployment.yaml (add Dapr annotations)

Database:
└── migrations/003_processed_events.sql (new table)
```

---

Begin with RESEARCH PHASE documenting:
1. All direct service calls to remove from backend-api
2. Current Helm chart structure
3. Existing environment variables needed

## Response snapshot

Created comprehensive implementation plan for transforming monolithic todo app into event-driven microservices architecture using Dapr runtime.

**Key Deliverables:**

1. **plan.md** - Complete implementation plan with:
   - Technical context (Python 3.12+, FastAPI, Dapr, Redpanda)
   - Constitution check (all 5 principles passed)
   - 12 implementation phases in correct order
   - Event schema definitions
   - Service contracts
   - Data model with new `processed_events` table
   - Architecture diagram
   - Testing strategy (Phase A: Docker, Phase B: Minikube, Phase C: E2E)
   - Risk analysis and rollback strategy

2. **research.md** - Codebase analysis findings:
   - Current monolithic structure documented
   - Direct service calls identified (routes/tasks.py lines 167-175, 264-275, 330-337, 377-384)
   - Existing Helm chart structure
   - Authentication flow
   - Environment variables required

3. **data-model.md** - Database schema:
   - Existing tables (task, notifications, audit_logs) unchanged
   - New `processed_events` table for idempotency
   - Entity relationships diagram
   - Query patterns for multi-tenancy

4. **contracts/events.yaml** - 6 event definitions:
   - task-created, task-updated, task-completed, task-deleted
   - reminder-due, task-updates
   - Complete schemas with examples
   - Publisher/subscriber mappings

5. **contracts/api-openapi.yaml** - OpenAPI 3.0 spec:
   - All CRUD endpoints for tasks, notifications, audit
   - Request/response schemas
   - Authentication requirements

6. **quickstart.md** - Developer guide:
   - Local Docker setup
   - Minikube deployment steps
   - Testing and troubleshooting commands

**Architecture Summary:**
- 6 microservices (frontend, backend-api, recurring-service, notification-service, audit-service, websocket-service)
- Redpanda as Kafka-compatible message broker
- Dapr sidecars on all pods for pub/sub, service invocation, state management
- At-least-once delivery with idempotency tracking
- Real-time updates via WebSocket service

## Outcome

- ✅ Impact: Architecture transformation plan complete with 12 phases, 6 microservices, 6 Kafka topics
- 🧪 Tests: Testing strategy defined (Docker, Minikube, E2E event flow)
- 📁 Files: 6 planning artifacts created (plan.md, research.md, data-model.md, quickstart.md, events.yaml, api-openapi.yaml)
- 🔁 Next prompts: `/sp.tasks` to generate actionable implementation tasks
- 🧠 Reflection: Comprehensive codebase research completed via exploration agent; all direct service calls identified for replacement with event publishing

## Evaluation notes (flywheel)

- Failure modes observed: None during planning phase
- Graders run and results (PASS/FAIL): Constitution check PASSED (all 5 principles)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Validate Dapr component configurations with actual Redpanda deployment before implementing microservices
