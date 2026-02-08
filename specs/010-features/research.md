# Research: Advanced Task Features

**Branch**: `010-features` | **Date**: 2026-02-02

## Overview

This document captures research findings and decisions for implementing the Advanced Task Features in the monolithic todo app (branch 010-features).

## Research Questions & Decisions

### 1. Recurring Task Date Calculation

**Question**: How to handle edge cases in date recurrence (leap years, end-of-month)?

**Decision**: Use Python `dateutil.relativedelta` for reliable recurrence calculation.

**Rationale**:
- `relativedelta` correctly handles month/year boundaries
- Jan 31 + 1 month → Feb 28/29 (not March 2/3)
- Handles leap years automatically
- Industry standard for recurrence calculations

**Alternatives Considered**:
- `datetime.timedelta`: Doesn't handle variable-length months
- Manual calculation: Prone to edge case bugs
- Custom recurrence library: Unnecessary dependency

**Implementation Note**:
```python
from dateutil.relativedelta import relativedelta

def calculate_next_due_date(rule: str, current_due_date: date) -> date:
    if rule == "daily":
        return current_due_date + timedelta(days=1)
    elif rule == "weekly":
        return current_due_date + timedelta(weeks=1)
    elif rule == "monthly":
        return current_due_date + relativedelta(months=1)
    elif rule == "yearly":
        return current_due_date + relativedelta(years=1)
```

---

### 2. AsyncIO Background Task Lifecycle

**Question**: How to ensure reminder scheduler starts on FastAPI startup and handles graceful shutdown?

**Decision**: Use FastAPI `lifespan` context manager with `asyncio.create_task()` for background scheduler.

**Rationale**:
- Integrates with existing lifespan pattern in `main.py`
- `asyncio.create_task()` runs coroutine concurrently
- `asyncio.Event` provides clean shutdown signaling
- Follows FastAPI best practices for background tasks

**Alternatives Considered**:
- `BackgroundTasks` from FastAPI: Only runs during request, not continuous
- Separate process: Overkill for simple polling, adds complexity
- Celery/APScheduler: Unnecessary dependencies for monolithic architecture

**Implementation Pattern**:
```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    reminder_service = ReminderService(...)
    await reminder_service.start()

    yield

    # Shutdown
    await reminder_service.stop()
```

---

### 3. Timezone Handling for Reminders

**Question**: How to store and compare reminder_at times across timezones?

**Decision**: Store all datetimes as UTC (TIMESTAMPTZ), convert to user timezone in frontend.

**Rationale**:
- Prevents ambiguity (DST transitions)
- Database remains timezone-agnostic
- Frontend can display in user's local timezone
- Consistent with existing `due_date` handling (DATE type, timezone-less by design)

**Alternatives Considered**:
- Store in user timezone: Ambiguous during DST transitions
- Store both UTC and local timezone: Redundant, unnecessary complexity

**Implementation Note**:
- Backend: Always use `datetime.now(timezone.utc)` for comparisons
- Frontend: Use `Intl.DateTimeFormat` for local display
- Migration: Use `TIMESTAMPTZ` column type for `reminder_at`, `recurring_end_date`

---

### 4. Audit Logging Error Handling

**Question**: What happens when database connection fails during audit write?

**Decision**: Log to stderr as fallback; never block main operation.

**Rationale**:
- Audit is observability concern, not critical path
- Per spec edge case guidance: "Should not block main operation"
- Degrades gracefully (DB down = no audit, but app still works)

**Alternatives Considered**:
- Raise exception: Blocks user operations, bad UX
- Retry queue: Overkill for this branch (event-driven in branch 012)
- In-memory buffer: Lost data on restart

**Implementation Pattern**:
```python
async def log_event(...) -> Optional[AuditLog]:
    try:
        # Write to database
        ...
    except Exception as e:
        # Fallback: stderr logging
        print(f"Audit logging failed: {e}", file=sys.stderr)
        return None  # Don't raise
```

---

### 5. Tags Storage Format

**Question**: How to store tags for efficient querying?

**Decision**: JSONB array in PostgreSQL, with GIN index for containment queries.

**Rationale**:
- Flexible schema (no tag table migrations)
- Efficient `@>` operator for "contains" queries
- Native PostgreSQL JSONB support
- Can store tags directly on Task model

**Alternatives Considered**:
- Separate tags table + junction table: Overkill for simple labels
- Comma-separated string: No efficient contains query
- Array type: Less flexible than JSONB

**Implementation Note**:
```sql
ALTER TABLE task ADD COLUMN tags JSONB DEFAULT '[]'::jsonb;
CREATE INDEX idx_task_tags ON task USING GIN (tags);

-- Query for tasks with specific tag
SELECT * FROM task WHERE tags @> '["urgent"]'::jsonb;
```

---

### 6. Missed Reminder Recovery

**Question**: How to handle reminders that fired while server was down?

**Decision**: On scheduler startup, query for `reminder_at < NOW() AND reminder_sent = false` and process immediately.

**Rationale**:
- Spec explicitly requires this behavior (FR-006b)
- Simple query-based recovery
- Ensures no reminders are lost

**Alternatives Considered**:
- Skip missed reminders: Violates spec
- Separate recovery job: Unnecessary complexity
- Persistent queue: Overkill for monolith

**Implementation Pattern**:
```python
async def _scheduler_loop(self):
    # First run: process all missed reminders
    await self.process_due_reminders()  # Gets all past due reminders

    # Then: normal 60-second interval
    while not self._stop_event.is_set():
        await asyncio.sleep(60)
        await self.process_due_reminders()
```

---

## Technical Patterns

### AsyncIO Background Task Pattern

```python
class ReminderService:
    def __init__(self, session_factory, notification_service):
        self.session_factory = session_factory
        self.notification_service = notification_service
        self._task: Optional[asyncio.Task] = None
        self._stop_event = asyncio.Event()

    async def start(self):
        """Start the reminder scheduler."""
        if self._task is None or self._task.done():
            self._stop_event.clear()
            self._task = asyncio.create_task(self._scheduler_loop())

    async def stop(self):
        """Stop the reminder scheduler."""
        self._stop_event.set()
        if self._task:
            await self._task

    async def _scheduler_loop(self):
        """Background task that runs every 60 seconds."""
        while not self._stop_event.is_set():
            try:
                await self.process_due_reminders()
                await asyncio.sleep(60)
            except Exception as e:
                print(f"Reminder scheduler error: {e}")
                await asyncio.sleep(60)
```

### Service Layer Dependency Injection

```python
# In main.py lifespan
async with async_session_factory() as session:
    audit_service = AuditService(session)
    notification_service = NotificationService(session, audit_service)
    reminder_service = ReminderService(async_session_factory, notification_service)
    await reminder_service.start()

# In routes
@router.post("/tasks")
async def create_task(
    audit_service: AuditService = Depends(get_audit_service),
    notification_service: NotificationService = Depends(get_notification_service),
    ...
):
    # Use injected services
    await audit_service.log_event(...)
```

### JSONB Tag Query Pattern

```python
# Filter by tag
query = select(Task).where(
    and_(
        Task.user_id == user_id,
        Task.tags.contains(['urgent'])  # JSONB contains operator
    )
)

# SQLAlchemy JSONB contains
from sqlalchemy import cast
from sqlalchemy.dialects.postgresql import JSONB

query = select(Task).where(
    Task.tags.op('@>')(cast(['urgent'], JSONB))
)
```

---

## Dependencies

### Python Packages

| Package | Version | Purpose |
|---------|---------|---------|
| python-dateutil | 2.8+ | Recurring date calculation (relativedelta) |
| fastapi | 0.104+ | Web framework (existing) |
| sqlmodel | 0.0.14+ | ORM (existing) |
| asyncpg | 0.29+ | Async PostgreSQL driver (existing) |

### Frontend Packages

| Package | Version | Purpose |
|---------|---------|---------|
| react-hook-form | 7.x | Form handling (existing) |
| lucide-react | latest | Bell icon (existing) |

---

## Performance Considerations

### Database Indexes

- `idx_task_reminder_at`: Essential for reminder polling query
- `idx_task_tags (GIN)`: Essential for tag filtering performance
- `idx_audit_logs_user_id + timestamp`: Essential for audit log query performance

### Query Optimization

- Reminder polling: Use `reminder_at <= NOW() AND reminder_sent = false` index
- Tag filtering: Use GIN `@>` operator, not `ANY()` or array overlap
- Audit log pagination: Limit to most recent 100 entries by default

### AsyncIO Considerations

- Background task uses `asyncio.sleep()` not `time.sleep()` to avoid blocking event loop
- Database queries use async session factory
- Service methods are all `async def`

---

## Migration Path to Branch 012-dapr-kafka

This research specifically addresses the **monolithic** implementation (branch 010-features). The following migrations will occur in branch 012-dapr-kafka:

| Feature | 010-features | 012-dapr-kafka |
|---------|-------------|----------------|
| Reminder triggering | `asyncio.create_task()` + 60s sleep | Dapr Jobs API (precise scheduling) |
| Audit logging | Direct DB write | Event publishing via Dapr Pub/Sub |
| Notification delivery | In-app only | + Email/push (optional) |
| Architecture | Single FastAPI app | 5 microservices |

**Backward Compatibility Note**: All database schema changes remain compatible. The migration is primarily code refactoring.
