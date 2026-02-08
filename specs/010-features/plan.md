# Implementation Plan: Advanced Task Features

**Branch**: `010-features` | **Date**: 2026-02-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-features/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This branch implements Phase 1 of Phase V deployment: **Advanced Task Features** for the monolithic todo app. The feature adds four major capabilities: **Recurring Tasks** (daily/weekly/monthly/yearly), **Due Dates & Reminders** (with in-app notifications), **Tags** (custom labels for organization), and **Audit Trail** (complete operation logging).

**Technical Approach**: Monolithic architecture extension only. No microservices, no Dapr, no Kafka - those come in branches 011-012. This branch uses:
- Database schema extensions (new columns + 2 new tables)
- AsyncIO background task for reminder polling (60-second intervals)
- Synchronous audit logging (to be upgraded to event-driven in branch 012-dapr-kafka)
- Frontend form extensions and notification panel component

## Technical Context

**Language/Version**: Python 3.12+ (backend), TypeScript 5+ (frontend with Next.js 16+)
**Primary Dependencies**:
  - Backend: FastAPI, SQLModel, asyncpg (Neon PostgreSQL), asyncio
  - Frontend: Next.js 16 App Router, React Hook Form, Tailwind CSS
**Storage**: Neon Serverless PostgreSQL (SSL required, serverless)
**Testing**: pytest (backend), Jest/Playwright (frontend)
**Target Platform**: Linux server (backend), Web browser (frontend)
**Project Type**: web (backend + frontend)
**Performance Goals**:
  - Task creation with new fields: <500ms
  - Recurring task next-instance creation: <1s
  - Reminder notification creation: within 60s of reminder time
  - Tag filter response: <500ms
**Constraints**:
  - Monolithic architecture only (no microservices split yet)
  - No Dapr or Kafka in this branch
  - Reminder triggering via asyncio background polling (not Dapr Jobs API)
  - Audit logging synchronous (to be async/event-driven in branch 012)
**Scale/Scope**:
  - Single-user focused (multi-tenant via user_id isolation)
  - ~4 new database tables/columns
  - ~5 new frontend components
  - ~3 new backend services/modules

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Universal Logic Decoupling
**Status**: PASS
- All new business logic (recurring task calculation, reminder processing, audit logging) will be in dedicated service modules
- Service layer (`TaskService`, `ReminderService`, `AuditService`) remains decoupled from API routes and MCP tools
- Frontend components consume APIs without direct business logic

### Principle II: AI-Native Interoperability (MCP-First)
**Status**: PASS
- MCP tools will be extended to support new fields (recurring_rule, reminder_at, tags)
- All new functionality exposed via stateless, typed MCP tools
- Tool definitions remain clear and distinct for natural language processing

### Principle III: Strict Statelessness
**Status**: PASS (with minor noted exception)
- Reminder scheduler uses asyncio background task (in-memory state for scheduler lifecycle only)
- All reminder data persisted to database (reminder_at, reminder_sent flags)
- On restart, missed reminders are recovered from database state
- No session state stored in memory

### Principle IV: Event-Driven Decoupling
**Status**: DEFERRED (by design for this branch)
- Spec explicitly defers event publishing to branch 012-dapr-kafka
- Audit logging synchronous in this branch (acceptable per scope)
- Reminders use direct database polling (acceptable for monolith)
- **Justification**: Event-driven architecture requires Dapr/Kafka infrastructure not available until branch 012

### Principle V: Zero-Trust Multi-Tenancy
**Status**: PASS
- All new queries scoped to authenticated user_id
- Row-level enforcement in application layer
- Notifications and audit logs filtered by user_id
- JWT validation on all API endpoints

## Project Structure

### Documentation (this feature)

```text
specs/010-features/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (to be created)
├── data-model.md        # Phase 1 output (to be created)
├── quickstart.md        # Phase 1 output (to be created)
├── contracts/           # Phase 1 output (to be created)
│   └── api.yaml         # OpenAPI spec for new endpoints
├── checklists/
│   └── requirements.md  # Requirements quality checklist (completed)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
phase-5/
├── backend/
│   ├── src/
│   │   └── backend/
│   │       ├── models/
│   │       │   ├── task.py          # MODIFY: Add recurring, reminder, tags fields
│   │       │   ├── audit_log.py     # CREATE: New AuditLog model
│   │       │   └── notification.py  # CREATE: New Notification model
│   │       ├── services/
│   │       │   ├── task_service.py  # MODIFY: Add recurring logic
│   │       │   ├── reminder_service.py  # CREATE: AsyncIO scheduler + reminder processing
│   │       │   ├── audit_service.py     # CREATE: Audit logging service
│   │       │   └── notification_service.py  # CREATE: Notification CRUD
│   │       ├── routes/
│   │       │   ├── tasks.py         # MODIFY: Support new fields in endpoints
│   │       │   ├── notifications.py # CREATE: Notification endpoints
│   │       │   └── audit.py         # CREATE: Audit log endpoint
│   │       ├── middleware/
│   │       │   └── auth.py          # REFERENCE: Authentication pattern
│   │       └── main.py              # MODIFY: Start reminder scheduler on startup
│   ├── migrations/
│   │   └── 002_phase5_features.sql  # CREATE: Database migration
│   └── tests/
│       └── test_phase5_features.py  # CREATE: Integration tests
│
└── frontend/
    └── src/
        ├── components/
        │   ├── tasks/
        │   │   ├── TaskForm.tsx      # MODIFY: Add recurring/reminder/tags inputs
        │   │   ├── TaskItem.tsx      # MODIFY: Display indicators (🔄🔔tags)
        │   │   ├── TaskFilters.tsx   # MODIFY: Add tag filter
        │   │   └── TagBadge.tsx      # CREATE: Tag display component
        │   ├── notifications/
        │   │   ├── NotificationPanel.tsx   # CREATE: Bell + dropdown
        │   │   └── NotificationItem.tsx    # CREATE: Single notification display
        │   └── layout/
        │       └── Header.tsx        # MODIFY: Add notification bell
        ├── types/
        │   └── task.ts               # MODIFY: Extend Task interface
        └── lib/
            └── api/
                └── types.ts          # MODIFY: Add notification/audit types
```

**Structure Decision**: Option 2 (Web application) - existing backend/frontend split confirmed from codebase examination.

## Complexity Tracking

> **No Constitution violations requiring justification.**
> All deferrals (event-driven, Dapr Jobs API) are explicitly scoped to future branches per spec.

## Phase 0: Research & Decisions

### Research Questions

1. **Recurring Task Date Calculation**
   - Question: How to handle edge cases in date recurrence (leap years, end-of-month)?
   - Approach: Use Python `dateutil.relativedelta` for reliable recurrence calculation
   - Rationale: Handles month/year boundaries correctly (Jan 31 → Feb 28/29)

2. **AsyncIO Background Task Lifecycle**
   - Question: How to ensure reminder scheduler starts on FastAPI startup and handles graceful shutdown?
   - Approach: Use FastAPI `lifespan` context manager with `asyncio.create_task()` for background scheduler
   - Rationale: Integrates with existing lifespan pattern in main.py

3. **Timezone Handling for Reminders**
   - Question: How to store and compare reminder_at times across timezones?
   - Approach: Store all datetimes as UTC (TIMESTAMPTZ), convert to user timezone in frontend
   - Rationale: Prevents ambiguity, database remains timezone-agnostic

4. **Audit Logging Error Handling**
   - Question: What happens when database connection fails during audit write?
   - Approach: Log to stderr as fallback; never block main operation
   - Rationale: Audit is observability concern, not critical path (per spec edge case guidance)

5. **Tags Storage Format**
   - Question: How to store tags for efficient querying?
   - Approach: JSONB array in PostgreSQL, with GIN index for containment queries
   - Rationale: Flexible schema, efficient `@>` operator for "contains" queries

6. **Missed Reminder Recovery**
   - Question: How to handle reminders that fired while server was down?
   - Approach: On scheduler startup, query for `reminder_at < NOW() AND reminder_sent = false` and process immediately
   - Rationale: Spec explicitly requires this behavior (FR-006b)

### Research Output

See [research.md](./research.md) for detailed findings on:
- Python recurrence calculation patterns
- AsyncIO scheduler lifecycle management
- PostgreSQL JSONB indexing strategies
- FastAPI background task patterns

## Phase 1: Design & Contracts

### Data Model

See [data-model.md](./data-model.md) for complete entity definitions:
- **Task** (extended): Adds `recurring_rule`, `recurring_end_date`, `parent_task_id`, `reminder_at`, `reminder_sent`, `tags`
- **AuditLog**: New entity with `event_type`, `entity_type`, `entity_id`, `user_id`, `timestamp`, `data`
- **Notification**: New entity with `id`, `user_id`, `message`, `read`, `created_at`, `task_id`

### API Contracts

See [contracts/api.yaml](./contracts/api.yaml) for OpenAPI specification of:
- Extended task endpoints (POST/PUT/PATCH /api/{user_id}/tasks)
- New notification endpoints (GET/POST /api/{user_id}/notifications)
- New audit endpoint (GET /api/{user_id}/audit)

### Quickstart Guide

See [quickstart.md](./quickstart.md) for:
- Development environment setup
- Database migration execution
- Running tests
- Manual testing procedures

## Implementation Tasks

### Task 1: Database Migration (P0 - Blocks Everything Else)

**File**: `phase-5/backend/migrations/002_phase5_features.sql`

**Changes**:
```sql
-- Extend task table
ALTER TABLE task ADD COLUMN IF NOT EXISTS recurring_rule VARCHAR(20);
ALTER TABLE task ADD COLUMN IF NOT EXISTS recurring_end_date TIMESTAMPTZ;
ALTER TABLE task ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES task(id) ON DELETE SET NULL;
ALTER TABLE task ADD COLUMN IF NOT EXISTS reminder_at TIMESTAMPTZ;
ALTER TABLE task ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE task ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_recurring_rule ON task(recurring_rule);
CREATE INDEX IF NOT EXISTS idx_task_reminder_at ON task(reminder_at);
CREATE INDEX IF NOT EXISTS idx_task_parent_task_id ON task(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_task_tags ON task USING GIN (tags);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    task_id UUID REFERENCES task(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_task_id ON notifications(task_id);
```

**Acceptance**:
- Migration runs without errors
- All tables created with correct schema
- Indexes created for performance
- Foreign key constraints valid

---

### Task 2: Backend Models - Task Extension (P0)

**File**: `phase-5/backend/src/backend/models/task.py`

**Changes**:
1. Import `datetime`, `List` from typing
2. Add new fields to `Task` SQLModel class:
   - `recurring_rule: Optional[str] = Field(default=None)`
   - `recurring_end_date: Optional[datetime] = Field(default=None)`
   - `parent_task_id: Optional[UUID] = Field(default=None, foreign_key="task.id")`
   - `reminder_at: Optional[datetime] = Field(default=None)`
   - `reminder_sent: bool = Field(default=False)`
   - `tags: List[str] = Field(default=[], sa_column=Column(JSONB))`
3. Update `TaskCreate` and `TaskUpdate` Pydantic models with new optional fields
4. Update `to_dict()` method to include new fields
5. Update `TaskResponse.from_task()` to include new fields

**Dependencies**: Task 1 (migration)

---

### Task 3: Backend Models - New Models (P0)

**Files**:
- `phase-5/backend/src/backend/models/audit_log.py` (CREATE)
- `phase-5/backend/src/backend/models/notification.py` (CREATE)

**audit_log.py**:
```python
from datetime import datetime
from enum import Enum
from typing import Optional, Dict, Any
from uuid import UUID, uuid4
from sqlmodel import Field, SQLModel

class EventType(str, Enum):
    TASK_CREATED = "task_created"
    TASK_UPDATED = "task_updated"
    TASK_COMPLETED = "task_completed"
    TASK_DELETED = "task_deleted"

class AuditLog(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    event_type: EventType
    entity_type: str  # "task"
    entity_id: UUID
    user_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    data: Dict[str, Any] = Field(default={})

class AuditLogResponse(BaseModel):
    id: str
    event_type: EventType
    entity_type: str
    entity_id: str
    user_id: str
    timestamp: datetime
    data: Dict[str, Any]
```

**notification.py**:
```python
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4
from sqlmodel import Field, SQLModel

class Notification(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: str
    message: str
    read: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    task_id: Optional[UUID] = Field(default=None, foreign_key="task.id")

class NotificationResponse(BaseModel):
    id: str
    user_id: str
    message: str
    read: bool
    created_at: datetime
    task_id: Optional[str]
```

**Dependencies**: Task 1 (migration)

---

### Task 4: Audit Service (P0)

**File**: `phase-5/backend/src/backend/services/audit_service.py` (CREATE)

**Content**:
```python
from typing import Dict, Any
from uuid import UUID
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from backend.models.audit_log import AuditLog, EventType

class AuditService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def log_event(
        self,
        event_type: EventType,
        entity_type: str,
        entity_id: UUID,
        user_id: str,
        data: Dict[str, Any]
    ) -> Optional[AuditLog]:
        """Log an audit event. Never blocks on failure - logs to stderr if DB fails."""
        try:
            log = AuditLog(
                event_type=event_type,
                entity_type=entity_type,
                entity_id=entity_id,
                user_id=user_id,
                data=data
            )
            self.session.add(log)
            await self.session.commit()
            await self.session.refresh(log)
            return log
        except Exception as e:
            # Never block main operation for audit failures
            print(f"Audit logging failed: {e}", file=sys.stderr)
            return None
```

**Dependencies**: Task 3

---

### Task 5: Notification Service (P1)

**File**: `phase-5/backend/src/backend/services/notification_service.py` (CREATE)

**Content**:
```python
from typing import List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from backend.models.notification import Notification
from backend.models.audit_log import AuditService, EventType

class NotificationService:
    def __init__(self, session: AsyncSession, audit_service: AuditService):
        self.session = session
        self.audit = audit_service

    async def create(self, user_id: str, message: str, task_id: UUID = None) -> Notification:
        """Create a new notification."""
        notif = Notification(user_id=user_id, message=message, task_id=task_id)
        self.session.add(notif)
        await self.session.commit()
        await self.session.refresh(notif)
        return notif

    async def list(self, user_id: str, unread_only: bool = False) -> List[Notification]:
        """List notifications for a user."""
        query = select(Notification).where(Notification.user_id == user_id)
        if unread_only:
            query = query.where(Notification.read == False)
        query = query.order_by(Notification.created_at.desc())
        result = await self.session.execute(query)
        return result.scalars().all()

    async def mark_read(self, user_id: str, notification_id: UUID) -> bool:
        """Mark a notification as read."""
        query = select(Notification).where(
            and_(Notification.id == notification_id, Notification.user_id == user_id)
        )
        result = await self.session.execute(query)
        notif = result.scalar_one_or_none()
        if notif:
            notif.read = True
            await self.session.commit()
            return True
        return False
```

**Dependencies**: Task 3

---

### Task 6: Reminder Service (P1)

**File**: `phase-5/backend/src/backend/services/reminder_service.py` (CREATE)

**Content**:
```python
import asyncio
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from backend.models.task import Task
from backend.services.notification_service import NotificationService

class ReminderService:
    def __init__(self, session_factory, notification_service: NotificationService):
        self.session_factory = session_factory
        self.notification_service = notification_service
        self._task: Optional[asyncio.Task] = None
        self._stop_event = asyncio.Event()

    async def process_due_reminders(self):
        """Process all reminders that are due but not yet sent."""
        async with self.session_factory() as session:
            # Find tasks with due reminders that haven't been sent
            now = datetime.now(timezone.utc)
            query = select(Task).where(
                and_(
                    Task.reminder_at <= now,
                    Task.reminder_sent == False
                )
            )
            result = await session.execute(query)
            tasks = result.scalars().all()

            for task in tasks:
                try:
                    # Create notification
                    await self.notification_service.create(
                        user_id=task.user_id,
                        message=f"Reminder: {task.title} is due!",
                        task_id=task.id
                    )
                    # Mark as sent
                    task.reminder_sent = True
                    await session.commit()
                except Exception as e:
                    print(f"Failed to process reminder for task {task.id}: {e}")
                    await session.rollback()

    async def _scheduler_loop(self):
        """Background task that runs every 60 seconds."""
        while not self._stop_event.is_set():
            try:
                await self.process_due_reminders()
                # Process any missed reminders on first run
                await asyncio.sleep(60)
            except Exception as e:
                print(f"Reminder scheduler error: {e}")
                await asyncio.sleep(60)

    async def start(self):
        """Start the reminder scheduler."""
        if self._task is None or self._task.done():
            self._stop_event.clear()
            self._task = asyncio.create_task(self._scheduler_loop())
            print("✅ Reminder scheduler started")

    async def stop(self):
        """Stop the reminder scheduler."""
        self._stop_event.set()
        if self._task:
            await self._task
            print("✅ Reminder scheduler stopped")
```

**Dependencies**: Task 3, Task 5

---

### Task 7: Recurring Task Logic in Task Service (P1)

**File**: `phase-5/backend/src/backend/services/task_service.py` (MODIFY)

**Changes**:
1. Add method `_calculate_next_due_date(rule: str, current_due_date) -> date` using `dateutil.relativedelta`
2. Add method `create_next_recurring_task(user_id, task) -> Task` that:
   - Checks `recurring_end_date` hasn't passed
   - Calculates next due date
   - Creates new task with same title, description, etc., but new due_date
   - Sets `parent_task_id` to original task
3. Modify `toggle()` method: when task.completed becomes True:
   - Check if task has `recurring_rule`
   - If yes and `recurring_end_date` not exceeded, call `create_next_recurring_task()`
4. Add validation in `create()` and `update()`:
   - If `recurring_rule` is set, require `due_date`
   - If `recurring_end_date` is set, must be after `due_date`

**Dependencies**: Task 1, Task 2

---

### Task 8: Task Routes Updates (P1)

**File**: `phase-5/backend/src/backend/routes/tasks.py` (MODIFY)

**Changes**:
1. Update imports to include AuditService, NotificationService
2. Inject audit_service dependency into all routes
3. In `create_task()`:
   - Accept new optional fields (recurring_rule, recurring_end_date, reminder_at, tags)
   - Validate recurring task constraints
   - Call `audit_service.log_event(TASK_CREATED, ...)` after creation
4. In `update_task()`:
   - Accept new optional fields
   - Validate recurring task constraints
   - Log before/after state to audit
5. In `toggle_complete()`:
   - Call recurring task logic from TaskService
   - Log completion to audit
6. In `delete_task()`:
   - Log deletion snapshot to audit

**Dependencies**: Task 2, Task 4, Task 7

---

### Task 9: Notification Routes (P1)

**File**: `phase-5/backend/src/backend/routes/notifications.py` (CREATE)

**Content**:
```python
from fastapi import APIRouter, Depends
from backend.middleware.auth import get_current_user
from backend.services.notification_service import NotificationService
from backend.models.notification import NotificationResponse

router = APIRouter()

@router.get("/notifications", response_model=List[NotificationResponse])
async def get_notifications(
    user_id: str,
    unread_only: bool = False,
    current_user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    await verify_user_ownership(user_id, current_user)
    service = NotificationService(session, ...)
    notifications = await service.list(user_id, unread_only)
    return [NotificationResponse(...) for n in notifications]

@router.post("/notifications/{id}/read")
async def mark_notification_read(...):
    # Mark notification as read
```

**Dependencies**: Task 5

---

### Task 10: Audit Routes (P1)

**File**: `phase-5/backend/src/backend/routes/audit.py` (CREATE)

**Content**:
```python
from fastapi import APIRouter, Depends
from backend.middleware.auth import get_current_user
from backend.services.audit_service import AuditService

router = APIRouter()

@router.get("/audit")
async def get_audit_log(
    user_id: str,
    current_user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    await verify_user_ownership(user_id, current_user)
    service = AuditService(session)
    # Return audit logs for user, most recent first
```

**Dependencies**: Task 4

---

### Task 11: Main.py - Scheduler Integration (P1)

**File**: `phase-5/backend/src/backend/main.py` (MODIFY)

**Changes**:
1. Import `ReminderService`
2. In `lifespan()` startup:
   - Initialize `NotificationService` and `AuditService`
   - Initialize `ReminderService(async_session_factory, notification_service)`
   - `await reminder_service.start()`
3. In `lifespan()` shutdown:
   - `await reminder_service.stop()`
4. Include new routers: `notifications`, `audit`

**Dependencies**: Task 6, Task 9, Task 10

---

### Task 12: Frontend - Task Type Extensions (P1)

**File**: `phase-5/frontend/src/types/task.ts` (MODIFY)

**Changes**:
```typescript
export interface Task {
  // existing fields...
  recurring_rule?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurring_end_date?: string;
  parent_task_id?: string;
  reminder_at?: string;
  reminder_sent?: boolean;
  tags?: string[];
}

export interface CreateTaskFormData {
  // existing fields...
  recurring_rule?: string;
  recurring_end_date?: string;
  reminder_at?: string;
  tags?: string;
}
```

**Dependencies**: None (can start in parallel)

---

### Task 13: Frontend - TaskForm Updates (P1)

**File**: `phase-5/frontend/src/components/tasks/TaskForm.tsx` (MODIFY)

**Changes**:
1. Add recurring dropdown (daily/weekly/monthly/yearly)
2. Add recurring end date picker
3. Add reminder datetime picker
4. Add tags input (comma-separated)
5. Add validation:
   - recurring_rule requires due_date
   - recurring_end_date must be after due_date

**Dependencies**: Task 12

---

### Task 14: Frontend - TaskItem Updates (P1)

**File**: `phase-5/frontend/src/components/tasks/TaskItem.tsx` (MODIFY)

**Changes**:
1. Display 🔄 indicator if `recurring_rule` is set
2. Display 🔔 indicator if `reminder_at` is set
3. Display tags as badges (TagBadge component)
4. Update `to_dict()` / `from_task()` conversions

**Dependencies**: Task 12

---

### Task 15: Frontend - TagBadge Component (P2)

**File**: `phase-5/frontend/src/components/tasks/TagBadge.tsx` (CREATE)

**Content**:
```typescript
// Visual badge component for tags
// Color-coded pills with consistent styling
```

**Dependencies**: None (can start in parallel)

---

### Task 16: Frontend - Notification Panel (P1)

**Files**:
- `phase-5/frontend/src/components/notifications/NotificationPanel.tsx` (CREATE)
- `phase-5/frontend/src/components/notifications/NotificationItem.tsx` (CREATE)
- `phase-5/frontend/src/components/layout/Header.tsx` (MODIFY)

**Content**:
- Bell icon with unread count badge
- Dropdown list of notifications
- Mark-as-read functionality
- Poll for new notifications every 30s or use real-time updates

**Dependencies**: Task 12

---

### Task 17: MCP Tools Update (P1)

**File**: `phase-5/backend/task_serves_mcp_tools.py` (MODIFY)

**Changes**:
1. Add `recurring_rule`, `recurring_end_date`, `reminder_at`, `tags` parameters to `create_task` tool
2. Add same parameters to `update_task` tool
3. Update tool docstrings to document new parameters

**Dependencies**: Task 2

---

### Task 18: Integration Tests (P2)

**File**: `phase-5/backend/tests/test_phase5_features.py` (CREATE)

**Tests**:
- Recurring task creation and next-instance generation
- Reminder creation and notification generation
- Tag filtering
- Audit log verification for all operations
- Missed reminder recovery on scheduler startup

**Dependencies**: All backend tasks

---

### Task 19: Manual Testing & QA (P2)

**File**: N/A (manual testing)

**Checklist**:
- [ ] Create daily recurring task, complete, verify next instance created
- [ ] Create weekly recurring task with end date, verify stops after end date
- [ ] Create task with reminder, wait for trigger, verify notification appears
- [ ] Create task with tags, verify filter works
- [ ] Check audit log shows all operations
- [ ] Restart server with missed reminders, verify recovery

**Dependencies**: All implementation tasks

---

## Testing Strategy

### Unit Tests
- **Recurring date calculation**: Test `_calculate_next_due_date()` with various inputs
- **Validation logic**: Test recurring task constraints
- **Tag filtering**: Test JSONB containment queries

### Integration Tests
- **Recurring task flow**: Create → Complete → Verify next instance
- **Reminder flow**: Create with reminder → Wait → Verify notification
- **Audit logging**: Verify audit entries for all operations
- **MCP tools**: Test create/update with new fields

### Manual Tests
- See Task 19 checklist above
- Cross-browser testing for notification panel
- Timezone boundary testing

### Performance Tests
- Tag filter query with 1000+ tasks, 50+ tags
- Reminder scheduler with 100+ pending reminders
- Audit log query performance

## Migration Path to Branch 012-dapr-kafka

When migrating from 010-features to 012-dapr-kafka:

| Feature | 010-features (current) | 012-dapr-kafka (future) |
|---------|----------------------|------------------------|
| Reminder triggering | AsyncIO polling (60s) | Dapr Jobs API (precise) |
| Audit logging | Synchronous DB write | Event publishing via Dapr Pub/Sub |
| Notification delivery | In-app only | + Email/push (optional) |
| Task completion sync | Direct DB write | Event-driven via task-updates topic |
| Architecture | Monolithic backend | 5 microservices split |

**Backward Compatibility**: All database schema changes remain compatible. Migration will be primarily code refactoring.
