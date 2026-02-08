# Tasks: Event-Driven Microservices with Dapr

**Input**: Design documents from `/specs/011-microservices-dapr/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: This implementation does not include explicit test tasks. Testing is done through quickstart.md validation scenarios.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `phase-5/backend/src/backend/`
- **Frontend**: `phase-5/frontend/src/`
- **Dapr Components**: `phase-5/k8s-dapr/`
- **Helm Charts**: `phase-5/helm-charts/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and Dapr infrastructure setup

- [X] T001 Verify Minikube is running with `minikube status`
- [X] T002 Configure Docker for Minikube with `eval $(minikube docker-env)`
- [X] T003 Install Dapr in Kubernetes cluster with `dapr init -k`
- [X] T004 Add Redpanda Helm repository with `helm repo add redpanda https://charts.redpanda.com`
- [X] T005 Install Redpanda with `helm install redpanda redpanda/redpanda --set resources.cpu.cores=1 --set resources.memory.container.max=1Gi`
- [X] T006 Wait for Redpanda to be ready with `kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=redpanda --timeout=300s`
- [X] T007 Create Kafka topics: task-created, task-completed, task-updated, task-deleted, reminder-due, task-updates via `kubectl exec -it redpanda-0 -- rpk topic create`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core Dapr components and backend infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Dapr Components

- [X] T008 [P] Create pubsub component in phase-5/k8s-dapr/components/pubsub.yaml (Kafka configuration)
- [X] T009 [P] Create statestore component in phase-5/k8s-dapr/components/statestore.yaml (PostgreSQL configuration for idempotency via Dapr State Store)
- [X] T010 [P] Create secrets component in phase-5/k8s-dapr/components/secrets.yaml (Kubernetes secrets reference)
- [X] T011 Create cron binding in phase-5/k8s-dapr/bindings/cron-binding.yaml (reminder checking every minute)
- [X] T012 Apply all Dapr components with `kubectl apply -f phase-5/k8s-dapr/components/` and `kubectl apply -f phase-5/k8s-dapr/bindings/`

### Backend Models & Utilities

- [X] T013 [P] Create dapr_state utility in phase-5/backend/src/backend/utils/dapr_state.py (dapr_save_state, dapr_get_state functions)
- [X] T013b [P] Create idempotency utility in phase-5/backend/src/backend/utils/idempotency.py (check_and_mark_processed function)
- [X] T014 [P] Create event publisher utility in phase-5/backend/src/backend/utils/event_publisher.py (Dapr pub/sub helper)

> [!CAUTION]
> Do NOT create a ProcessedEvent SQLModel class. Idempotency is handled via Dapr State Store.

### Database Migration

- [X] T015 Create Dapr state table migration in phase-5/backend/migrations/003_dapr_state.sql (generic key-value table for Dapr)
- [X] T016 Apply migration to Neon PostgreSQL with `psql $DATABASE_URL -f phase-5/backend/migrations/003_dapr_state.sql`

> [!IMPORTANT]
> Do NOT create a processed_events table. The `state` table is used by Dapr State Store for all key-value storage including idempotency.

### Multi-Entrypoint Dockerfile

- [X] T017 Create multi-entrypoint Dockerfile in phase-5/backend/Dockerfile (supports all 5 microservices from single image)
- [X] T018 Create .dockerignore file in phase-5/backend/.dockerignore (already exists)

### Environment Configuration

- [X] T019 [P] Update backend .env file in phase-5/backend/.env with DAPR_HOST and DAPR_HTTP_PORT variables
- [X] T020 [P] Update frontend .env.local file in phase-5/frontend/.env.local with DAPR_HOST and DAPR_HTTP_PORT variables

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Real-Time Task Updates Across Devices (Priority: P1) [US1]

**Goal**: Task changes appear instantly on all connected user sessions via WebSocket broadcasts

**Independent Test**: Create a task on Device A while having Device B open; verify the task appears on Device B within 2 seconds without manual refresh.

### Backend Implementation for US1

- [X] T021 [P] [US1] Create recurring_service.py entry point in phase-5/backend/src/backend/services/microservices/recurring_service.py
- [X] T022 [P] [US1] Create audit_service.py entry point in phase-5/backend/src/backend/services/microservices/audit_service.py
- [X] T023 [P] [US1] Create websocket_service.py entry point in phase-5/backend/src/backend/services/microservices/websocket_service.py (with ConnectionManager class)
- [X] T024 [US1] Implement idempotency check in audit_service.py (use check_and_mark_processed utility before handling events)
- [X] T025 [US1] Implement task event subscriptions in audit_service.py (subscribe to task-created, task-updated, task-completed, task-deleted)
- [X] T026 [US1] Implement task event subscriptions in websocket_service.py (subscribe to all task events)
- [X] T027 [US1] Implement WebSocket broadcast to connected clients in websocket_service.py
- [X] T028 [US1] Add /health endpoint to websocket_service.py in phase-5/backend/src/backend/services/microservices/websocket_service.py
- [X] T029 [US1] Add /ws WebSocket endpoint to websocket_service.py with user_id query parameter

### Modify Backend API for Event Publishing

- [X] T030 [US1] Remove direct audit_service calls from phase-5/backend/src/backend/routes/tasks.py (lines 167-175, 264-275, 330-337, 377-384)
- [X] T031 [US1] Import event_publisher in phase-5/backend/src/backend/routes/tasks.py
- [X] T032 [US1] Add publish_event call after task creation in POST /api/tasks endpoint (task-created event)
- [X] T033 [US1] Add publish_event call after task update in PUT /api/tasks/{id} endpoint (task-updated event)
- [X] T034 [US1] Add publish_event call after task completion in PATCH /api/tasks/{id}/complete endpoint (task-completed event)
- [X] T035 [US1] Add publish_event call before task deletion in DELETE /api/tasks/{id} endpoint (task-deleted event)

### Frontend API Proxy Routes

- [X] T036 [P] [US1] Create tasks API route in phase-5/frontend/src/app/api/tasks/route.ts (GET/POST proxy to backend-api via Dapr)
- [X] T037 [P] [US1] Create task detail API route in phase-5/frontend/src/app/api/tasks/[id]/route.ts (GET/PATCH/DELETE proxy to backend-api via Dapr)

### Helm Charts for US1 Services

- [X] T038 [P] [US1] Create recurring-service Helm chart from template with `helm create phase-5/helm-charts/recurring-service`
- [X] T039 [P] [US1] Create audit-service Helm chart from template with `helm create phase-5/helm-charts/audit-service`
- [X] T040 [P] [US1] Create websocket-service Helm chart from template with `helm create phase-5/helm-charts/websocket-service`
- [X] T041 [P] [US1] Update recurring-service values.yaml in phase-5/helm-charts/recurring-service/values.yaml with Dapr configuration (appId: recurring-service, appPort: 8001)
- [X] T042 [P] [US1] Update audit-service values.yaml in phase-5/helm-charts/audit-service/values.yaml with Dapr configuration (appId: audit-service, appPort: 8003)
- [X] T043 [P] [US1] Update websocket-service values.yaml in phase-5/helm-charts/websocket-service/values.yaml with Dapr configuration (appId: websocket-service, appPort: 8004)
- [X] T044 [P] [US1] Add Dapr annotations to recurring-service deployment.yaml template in phase-5/helm-charts/recurring-service/templates/deployment.yaml
- [X] T045 [P] [US1] Add Dapr annotations to audit-service deployment.yaml template in phase-5/helm-charts/audit-service/templates/deployment.yaml
- [X] T046 [P] [US1] Add Dapr annotations to websocket-service deployment.yaml template in phase-5/helm-charts/websocket-service/templates/deployment.yaml
- [X] T047 [P] [US1] Add LoadBalancer service to websocket-service values.yaml for external WebSocket access

### Update Existing Helm Charts

- [X] T048 [US1] Update backend values.yaml in phase-5/helm-charts/todo-backend/values.yaml with Dapr configuration (appId: backend-api, appPort: 8000)
- [X] T049 [US1] Add Dapr annotations to backend deployment.yaml template in phase-5/helm-charts/todo-backend/templates/deployment.yaml

**Checkpoint**: At this point, User Story 1 should be fully functional - task changes broadcast to all connected clients in real-time

---

## Phase 4: User Story 2 - Automatic Recurring Task Generation (Priority: P1) [US2]

**Goal**: Automatically create next occurrence when a recurring task is completed

**Independent Test**: Complete a recurring task and verify a new task with the next due date is created within 5 seconds.

### Backend Implementation for US2

- [X] T050 [US2] Add create_next_recurring method to TaskService in phase-5/backend/src/backend/services/task_service.py (calculates next due date based on recurring_rule)
- [X] T051 [US2] Implement task-completed event handler in recurring_service.py in phase-5/backend/src/backend/services/microservices/recurring_service.py
- [X] T052 [US2] Add idempotency check to recurring_service.py (use check_and_mark_processed before creating next task)
- [X] T053 [US2] Add task-created event publishing in recurring_service.py (publish event for newly created recurring task)
- [X] T054 [US2] Add /health endpoint to recurring_service.py in phase-5/backend/src/backend/services/microservices/recurring_service.py

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - recurring tasks generate next occurrences automatically

---

## Phase 5: User Story 3 - Timely Reminder Notifications (Priority: P2) [US3]

**Goal**: Users receive notifications when task reminders are due

**Independent Test**: Set a reminder for 1 minute in the future; verify notification appears at the correct time.

### Backend Implementation for US3

- [X] T055 [P] [US3] Create notification_service.py entry point in phase-5/backend/src/backend/services/microservices/notification_service.py
- [X] T056 [US3] Implement reminder cron binding handler in notification_service.py in phase-5/backend/src/backend/services/microservices/notification_service.py (@dapr.binding decorator)
- [X] T057 [US3] Add query for due reminders in notification_service.py (WHERE reminder_at <= NOW() AND reminder_sent = false)
- [X] T058 [US3] Add notification creation in notification_service.py (insert into notifications table)
- [X] T059 [US3] Add reminder_sent flag update in notification_service.py (mark task.reminder_sent = true)
- [X] T060 [US3] Add reminder-due event publishing in notification_service.py
- [X] T061 [US3] Add /health endpoint to notification_service.py in phase-5/backend/src/backend/services/microservices/notification_service.py

### Frontend API Proxy Routes for US3

- [X] T062 [P] [US3] Create notifications API route in phase-5/frontend/src/app/api/notifications/route.ts (GET proxy to notification-service via Dapr)
- [X] T063 [P] [US3] Create notification detail API route in phase-5/frontend/src/app/api/notifications/[id]/route.ts (PATCH/DELETE proxy to notification-service via Dapr)

### Helm Charts for US3 Service

- [X] T064 [P] [US3] Create notification-service Helm chart from template with `helm create phase-5/helm-charts/notification-service`
- [X] T065 [P] [US3] Update notification-service values.yaml in phase-5/helm-charts/notification-service/values.yaml with Dapr configuration (appId: notification-service, appPort: 8002)
- [X] T066 [P] [US3] Add Dapr annotations to notification-service deployment.yaml template in phase-5/helm-charts/notification-service/templates/deployment.yaml

**Checkpoint**: All user stories should now be independently functional - reminders trigger notifications automatically

---

## Phase 6: User Story 4 - Complete Audit Trail (Priority: P2) [US4]

**Goal**: Complete history of all task changes for accountability

**Independent Test**: Perform CRUD operations on tasks; verify all events are logged with timestamps and user IDs.

### Backend Implementation for US4

- [X] T067 [US4] Verify all event handlers in audit_service.py log events with full context (event_type, entity_type, entity_id, user_id, data)
- [X] T068 [US4] Verify idempotency via Dapr State Store in audit_service.py (prevent duplicate processing)
- [X] T069 [US4] Add audit log query endpoint to audit_service.py in phase-5/backend/src/backend/services/microservices/audit_service.py (GET /api/{user_id}/audit)

**Checkpoint**: All user stories should now be independently functional - complete audit trail maintained

---

## Phase 7: User Story 5 - Resilient Service Operation (Priority: P3) [US5]

**Goal**: Individual services fail gracefully without bringing down the entire application

**Independent Test**: Stop the audit-service; verify task creation still works and events are processed when service recovers.

### Backend Implementation for US5

- [X] T070 [P] [US5] Add circuit breaker configuration to backend-api in phase-5/backend/src/backend/main.py (timeout and retry for Dapr publish)
- [X] T071 [P] [US5] Add circuit breaker configuration to websocket_service.py (timeout for WebSocket connections)
- [X] T072 [P] [US5] Add circuit breaker configuration to recurring_service.py (timeout for database operations)
- [X] T073 [P] [US5] Add circuit breaker configuration to notification_service.py (timeout for database operations)
- [X] T074 [P] [US5] Add circuit breaker configuration to audit_service.py (timeout for database operations)
- [X] T075 [US5] Add graceful shutdown handling to all microservices in phase-5/backend/src/backend/services/microservices/*.py (lifespan shutdown events)

**Checkpoint**: All user stories should now be independently functional - services fail gracefully

---

## Phase 8: Docker Compose for Local Development

**Purpose**: Local testing without Minikube for faster development iteration

- [X] T076 [P] Create docker-compose.yml in phase-5/docker-compose.yml (redpanda, all microservices with Dapr sidecars)
- [X] T077 [P] Create local Dapr components directory in phase-5/k8s-dapr/components/local/ (local versions of pubsub, statestore)
- [ ] T078 Test docker-compose build in phase-5/ directory
- [ ] T079 Test docker-compose up -d in phase-5/ directory
- [ ] T080 Verify all services healthy via docker-compose ps

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

### Documentation

- [X] T081 [P] Update quickstart.md with actual deployment commands if needed
- [X] T082 [P] Create troubleshooting guide in phase-5/README.md (common issues and solutions)

### Security Hardening

- [X] T083 [P] Verify Kubernetes secrets are properly referenced in all Helm charts values.yaml files
- [X] T084 [P] Verify SSL/TLS configuration for Redpanda connections in phase-5/k8s-dapr/components/pubsub.yaml
- [X] T085 [P] Verify mTLS is enabled for Dapr sidecar communication

### Performance Optimization

- [X] T086 [P] Add readiness and liveness probes to all microservice Helm charts deployment.yaml templates
- [X] T087 [P] Configure resource requests and limits in all microservice Helm charts values.yaml files

### Final Validation

- [X] T088 Build backend image in Minikube Docker with `docker build -t phase5-backend:v1 phase-5/backend`
- [X] T089 Build frontend image in Minikube Docker with `docker build -t phase5-frontend:v1 phase-5/frontend`
- [X] T090 Deploy backend via Helm with `helm install backend phase-5/helm-charts/todo-backend`
- [X] T091 Deploy frontend via Helm with `helm install frontend phase-5/helm-charts/todo-frontend`
- [X] T092 Deploy recurring-service via Helm with `helm install recurring-service phase-5/helm-charts/recurring-service`
- [X] T093 Deploy notification-service via Helm with `helm install notification-service phase-5/helm-charts/notification-service`
- [X] T094 Deploy audit-service via Helm with `helm install audit-service phase-5/helm-charts/audit-service`
- [X] T095 Deploy websocket-service via Helm with `helm install websocket-service phase-5/helm-charts/websocket-service`
- [X] T096 Verify all pods are running with `kubectl get pods` (expect 2/2 for each - app + Dapr sidecar)
- [X] T097 Verify services are running with `kubectl get services`
- [X] T098 Start minikube tunnel for LoadBalancer access
- [X] T099 Run quickstart.md validation scenarios (create task, complete recurring task, test reminders, verify audit logs)
- [X] T100 Verify real-time updates by opening two browser tabs and observing WebSocket broadcasts

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately (infrastructure setup)
- **Foundational (Phase 2)**: Depends on Setup completion (Redpanda must be running) - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
  - US1 and US2 are both P1 and can be done in parallel
- **Docker Compose (Phase 8)**: Can be done after Phase 2 (optional for local development)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1) - Real-Time Updates**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1) - Recurring Tasks**: Can start after Foundational (Phase 2) - Independent of US1 but both are P1 MVP
- **User Story 3 (P2) - Reminders**: Can start after Foundational (Phase 2) - Independent of US1/US2
- **User Story 4 (P2) - Audit Trail**: Can start after Foundational (Phase 2) - Uses audit-service from US1
- **User Story 5 (P3) - Resilience**: Depends on all services being implemented

### Within Each User Story

- Models and utilities before services
- Services before Helm chart configuration
- Helm chart configuration before deployment
- Service implementation before frontend API routes
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks (T001-T007) can run sequentially (infrastructure prerequisites)
- All Dapr component creation tasks (T008-T012) can run after Redpanda is ready
- All model/utility tasks (T013-T014) can run in parallel
- All microservice entry point creation tasks (T021-T023 in US1) can run in parallel
- All Helm chart creation tasks (T038-T040 in US1) can run in parallel
- All values.yaml update tasks (T041-T043 in US1) can run in parallel
- All deployment annotation tasks (T044-T047 in US1) can run in parallel
- Different user stories (US1, US2, US3) can be worked on in parallel by different team members after Phase 2 completes
- All circuit breaker tasks (T070-T074 in US5) can run in parallel
- All documentation tasks (T081-T082 in Polish) can run in parallel
- All security hardening tasks (T083-T085 in Polish) can run in parallel
- All performance optimization tasks (T086-T087 in Polish) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all microservice entry point files together:
Task: T021 - Create recurring_service.py entry point
Task: T022 - Create audit_service.py entry point
Task: T023 - Create websocket_service.py entry point (with ConnectionManager)

# Launch all Helm chart creation together:
Task: T038 - Create recurring-service Helm chart
Task: T039 - Create audit-service Helm chart
Task: T040 - Create websocket-service Helm chart

# Launch all values.yaml updates together:
Task: T041 - Update recurring-service values.yaml
Task: T042 - Update audit-service values.yaml
Task: T043 - Update websocket-service values.yaml

# Launch all deployment annotation updates together:
Task: T044 - Add Dapr annotations to recurring-service deployment.yaml
Task: T045 - Add Dapr annotations to audit-service deployment.yaml
Task: T046 - Add Dapr annotations to websocket-service deployment.yaml
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 - Both P1)

1. Complete Phase 1: Setup (Redpanda, Dapr, Kafka topics)
2. Complete Phase 2: Foundational (Dapr components, models, Dockerfile)
3. Complete Phase 3: User Story 1 (Real-Time Updates)
4. Complete Phase 4: User Story 2 (Recurring Tasks)
5. **STOP and VALIDATE**: Test US1 and US2 independently
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP part 1!)
3. Add User Story 2 → Test independently → Deploy/Demo (MVP complete!)
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Real-Time Updates)
   - Developer B: User Story 2 (Recurring Tasks)
   - Developer C: User Story 3 (Reminders)
3. After US1-3 complete:
   - Developer A: User Story 4 (Audit Trail - integrates with US1 audit-service)
   - Developer B: User Story 5 (Resilience - cross-cutting)
   - Developer C: Docker Compose + Polish
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- US1 and US2 are both P1 (MVP scope)
- US3 and US4 are P2 (secondary features)
- US5 is P3 (infrastructure resilience)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- At-least-once delivery requires idempotency checks in all subscribers
- WebSocket connections tracked in Dapr state store for distributed state
- Dapr sidecars handle all service-to-service communication
