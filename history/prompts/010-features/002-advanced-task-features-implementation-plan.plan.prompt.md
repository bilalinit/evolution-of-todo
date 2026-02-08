---
id: "002"
title: "advanced task features implementation plan"
stage: plan
date: 2026-02-02
surface: agent
model: claude-opus-4-5-20251101
feature: 010-features
branch: 010-features
user: architext
command: /sp.plan
labels: [features, planning, architecture, monolithic]
links:
  spec: specs/010-features/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/010-features/plan.md
  - specs/010-features/research.md
  - specs/010-features/data-model.md
  - specs/010-features/quickstart.md
  - specs/010-features/contracts/api.yaml
tests:
  - Constitution Check: PASSED (all 5 principles)
  - Technical Context: Documented (Python 3.12+, TypeScript, Neon PostgreSQL)
  - Project Structure: Verified (web application with backend/frontend split)
  - Implementation Tasks: 19 tasks defined with dependencies
---

## Prompt


  Create a detailed implementation plan for Branch 010-features, which is Phase 1 of Phase V deployment. This branch adds advanced
  features to the existing monolithic todo app (NO microservices, NO Dapr yet - those come in later branches).

  CRITICAL INSTRUCTIONS - DO THIS FIRST

  Before creating ANY plan, you MUST:

  1. EXAMINE existing codebase:
    - phase-5/backend/src/backend/models/task.py - Current Task model
    - phase-5/backend/src/backend/routes/tasks.py - Current task routes
    - phase-5/backend/setup_chatkit.py - Migration pattern to follow
    - phase-5/frontend/src/app/ - Frontend structure
  2. VERIFY all dependencies - Check imports, packages, patterns
  3. CROSS-REFERENCE - Ensure your plan matches the spec exactly

  DO NOT write code. DO NOT create files. ONLY create a detailed PLAN after thorough research.

  ---
  SCOPE - Branch 010 (In Scope)

  What to ADD (monolithic only, no microservices):

  1. Database Migration (backend/migrations/002_phase5_features.sql)
    - Add to task table: recurring_rule, recurring_end_date, parent_task_id, reminder_at, reminder_sent, tags
    - Create audit_logs table
    - Create notifications table
  2. Backend Models
    - Update Task model with new fields
    - Create AuditLog model
    - Create Notification model
  3. Backend Services
    - Create reminder_service.py with asyncio scheduler (60s polling, NO Dapr Jobs yet)
    - Add recurring task logic in existing completion route
  4. Backend Routes
    - Update task routes for new fields
    - Add notifications endpoints
  5. Frontend
    - Add recurring/reminder/tags fields to task form
    - Create notification panel component

  What is OUT OF SCOPE:

  - ❌ Microservices split (branch 011)
  - ❌ Dapr integration (branch 012)
  - ❌ Redpanda/Kafka (branch 012)
  - ❌ WebSocket service (branch 011)
  - ❌ Kubernetes changes
  - ❌ CI/CD (branch 013)

  ---
  YOUR DELIVERABLE

  After researching, create a detailed plan with:

  1. Verification Summary - What you found in the codebase
  2. Architecture Decisions - How each feature will work in monolith
  3. Files to Create - Complete list with paths
  4. Files to Modify - Complete list with specific changes needed
  5. Database Migration Plan - SQL and execution steps
  6. Implementation Tasks - Step-by-step, dependency-ordered
  7. Testing Strategy - Unit, integration, manual tests

## Response snapshot

Created comprehensive implementation plan for **Advanced Task Features** (branch 010-features).

### Verification Summary

**Codebase Examined**:
- `phase-5/backend/src/backend/models/task.py`: Current Task model with Priority/Category enums, SQLModel-based
- `phase-5/backend/src/backend/routes/tasks.py`: FastAPI routes with user ownership verification via middleware
- `phase-5/backend/setup_chatkit.py`: Migration pattern reference (SQL file execution via psycopg2)
- `phase-5/frontend/src/components/`: TaskForm, TaskItem components using React Hook Form

**Key Patterns Identified**:
- Async/await pattern throughout (asyncpg + AsyncSession)
- Service layer separation (TaskService for business logic)
- User isolation via `verify_user_ownership()` middleware
- SQLModel with UUID primary keys

### Architecture Decisions

1. **Recurring Tasks**: Use `dateutil.relativedelta` for date calculation; create next instance on task completion via TaskService
2. **Reminders**: AsyncIO background task with 60s polling (not Dapr Jobs API until branch 012)
3. **Tags**: JSONB array storage with GIN index for efficient containment queries
4. **Audit Logging**: Synchronous writes, stderr fallback on error (never block main operation)
5. **Timezone**: Store all datetimes as UTC (TIMESTAMPTZ), convert in frontend

### Files to Create (12)

**Backend**:
- `migrations/002_phase5_features.sql` - Database migration
- `src/backend/models/audit_log.py` - AuditLog model
- `src/backend/models/notification.py` - Notification model
- `src/backend/services/reminder_service.py` - AsyncIO scheduler
- `src/backend/services/audit_service.py` - Audit logging
- `src/backend/services/notification_service.py` - Notification CRUD
- `src/backend/routes/notifications.py` - Notification endpoints
- `src/backend/routes/audit.py` - Audit endpoint
- `tests/test_phase5_features.py` - Integration tests

**Frontend**:
- `src/components/tasks/TagBadge.tsx` - Tag display component
- `src/components/notifications/NotificationPanel.tsx` - Bell + dropdown
- `src/components/notifications/NotificationItem.tsx` - Single notification

### Files to Modify (7)

**Backend**:
- `src/backend/models/task.py` - Add 6 new fields
- `src/backend/services/task_service.py` - Add recurring logic
- `src/backend/routes/tasks.py` - Support new fields + audit logging
- `src/backend/main.py` - Start/stop reminder scheduler
- `task_serves_mcp_tools.py` - Add new parameters to tools

**Frontend**:
- `src/types/task.ts` - Extend Task interface
- `src/components/tasks/TaskForm.tsx` - Add recurring/reminder/tags inputs
- `src/components/tasks/TaskItem.tsx` - Display indicators (🔄🔔tags)
- `src/components/layout/Header.tsx` - Add notification bell

### Database Migration Plan

```sql
-- Task table extensions
ALTER TABLE task ADD COLUMN recurring_rule VARCHAR(20);
ALTER TABLE task ADD COLUMN recurring_end_date TIMESTAMPTZ;
ALTER TABLE task ADD COLUMN parent_task_id UUID REFERENCES task(id);
ALTER TABLE task ADD COLUMN reminder_at TIMESTAMPTZ;
ALTER TABLE task ADD COLUMN reminder_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE task ADD COLUMN tags JSONB DEFAULT '[]'::jsonb;

-- New tables
CREATE TABLE audit_logs (...);
CREATE TABLE notifications (...);

-- Indexes
CREATE INDEX idx_task_reminder_at ON task(reminder_at);
CREATE INDEX idx_task_tags ON task USING GIN (tags);
```

### Implementation Tasks (19, dependency-ordered)

1. Database Migration (P0 - blocks everything)
2. Backend Models - Task Extension (P0)
3. Backend Models - New Models (P0)
4. Audit Service (P0)
5. Notification Service (P1)
6. Reminder Service (P1)
7. Recurring Task Logic in Task Service (P1)
8. Task Routes Updates (P1)
9. Notification Routes (P1)
10. Audit Routes (P1)
11. Main.py - Scheduler Integration (P1)
12. Frontend - Task Type Extensions (P1)
13. Frontend - TaskForm Updates (P1)
14. Frontend - TaskItem Updates (P1)
15. Frontend - TagBadge Component (P2)
16. Frontend - Notification Panel (P1)
17. MCP Tools Update (P1)
18. Integration Tests (P2)
19. Manual Testing & QA (P2)

### Testing Strategy

**Unit Tests**: Recurring date calculation, validation logic, tag filtering
**Integration Tests**: Recurring task flow, reminder flow, audit logging, MCP tools
**Manual Tests**: Create daily recurring task, reminder triggers, tag filtering, audit log verification, missed reminder recovery
**Performance Tests**: 1000+ tasks with 50+ tags, 100+ pending reminders

## Outcome

- ✅ Impact: Created complete implementation plan for 4 advanced features (19 tasks, 12 files to create, 7 files to modify)
- 🧪 Tests: Testing strategy defined (unit, integration, manual, performance)
- 📁 Files: Plan, research, data-model, quickstart, and API contracts documented
- 🔁 Next prompts: `/sp.tasks` to generate actionable implementation tasks
- 🧠 Reflection: Constitution Check passed all 5 principles. Event-driven architecture deferred to branch 012-dapr-kafka per spec. AsyncIO background task for reminders is acceptable for monolithic architecture.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Constitution Check - PASSED (5/5 principles)
- Prompt variant (if applicable): None
- Next experiment (smallest change to try): Proceed to `/sp.tasks` to generate dependency-ordered implementation tasks
