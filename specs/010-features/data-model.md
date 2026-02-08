# Data Model: Advanced Task Features

**Branch**: `010-features` | **Date**: 2026-02-02

## Overview

This document defines the data model changes required for the Advanced Task Features. All entities use SQLModel with async PostgreSQL support.

## Entity: Task (Extended)

### Existing Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| title | VARCHAR(200) | NOT NULL | Task title |
| description | TEXT | nullable | Task description |
| completed | BOOLEAN | DEFAULT false | Completion status |
| priority | VARCHAR(10) | NOT NULL | Priority level (low/medium/high) |
| category | VARCHAR(20) | NOT NULL | Category (work/personal/shopping/health/other) |
| due_date | DATE | nullable | Due date (date only, timezone-agnostic) |
| user_id | VARCHAR(255) | INDEX, NOT NULL | Owner user ID |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### New Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| recurring_rule | VARCHAR(20) | nullable | Recurrence rule: daily, weekly, monthly, yearly |
| recurring_end_date | TIMESTAMPTZ | nullable | Last date for recurrence generation |
| parent_task_id | UUID | FK → task.id, nullable | Links recurring instances |
| reminder_at | TIMESTAMPTZ | nullable | When to send reminder (UTC) |
| reminder_sent | BOOLEAN | DEFAULT false | Whether reminder was sent |
| tags | JSONB | DEFAULT '[]' | Array of tag strings |

### New Indexes

```sql
CREATE INDEX idx_task_recurring_rule ON task(recurring_rule);
CREATE INDEX idx_task_reminder_at ON task(reminder_at);
CREATE INDEX idx_task_parent_task_id ON task(parent_task_id);
CREATE INDEX idx_task_tags ON task USING GIN (tags);
```

### Validation Rules

1. **Recurring Task Constraints**:
   - If `recurring_rule` is set, `due_date` MUST be set
   - If `recurring_end_date` is set, MUST be after `due_date`
   - `recurring_rule` values: 'daily', 'weekly', 'monthly', 'yearly'

2. **Tag Constraints**:
   - Tags stored as JSONB array: `["urgent", "meeting"]`
   - Max 50 tags per task
   - Each tag max 50 characters
   - Tags are case-sensitive

3. **Reminder Constraints**:
   - `reminder_at` can be set independently of `due_date`
   - If both set, reminder typically before due date
   - `reminder_sent` flag prevents duplicate notifications

### State Transitions

```
┌─────────┐  create  ┌──────────┐  complete  ┌─────────────┐
│  None   │ ───────► │   Task   │ ──────────► │ Completed   │
└─────────┘          └──────────┘             │ (recurring) │
                                               └─────────────┘
                                                      │
                                                      │ create_next_instance()
                                                      ▼
                                               ┌──────────┐
                                               │ New Task │
                                               │ (next    │
                                               │  due)    │
                                               └──────────┘
```

**Recurring Instance Creation**:
1. User completes recurring task
2. System checks `recurring_end_date` hasn't passed
3. System calculates next due date using `relativedelta`
4. System creates new task with same attributes, new `due_date`, `parent_task_id` set

---

## Entity: AuditLog (New)

### Schema

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| event_type | VARCHAR(50) | NOT NULL | Event type (see EventType enum) |
| entity_type | VARCHAR(50) | NOT NULL | Entity type (e.g., "task") |
| entity_id | UUID | NOT NULL | ID of affected entity |
| user_id | VARCHAR(255) | INDEX, NOT NULL | User who performed action |
| timestamp | TIMESTAMPTZ | DEFAULT NOW(), INDEX | When event occurred |
| data | JSONB | DEFAULT {} | Event data snapshot |

### EventType Enum

```python
class EventType(str, Enum):
    TASK_CREATED = "task_created"
    TASK_UPDATED = "task_updated"
    TASK_COMPLETED = "task_completed"
    TASK_DELETED = "task_deleted"
```

### Audit Data Schema

**task_created**:
```json
{
  "task": {
    "id": "uuid",
    "title": "Task title",
    "priority": "medium",
    "category": "work",
    "due_date": "2026-02-03",
    "recurring_rule": "weekly",
    "tags": ["urgent"]
  }
}
```

**task_updated**:
```json
{
  "task_id": "uuid",
  "changes": {
    "title": {"old": "Old title", "new": "New title"},
    "completed": {"old": false, "new": true}
  },
  "before": { ... },
  "after": { ... }
}
```

**task_completed**:
```json
{
  "task_id": "uuid",
  "task_snapshot": { ... }  // Full task state before completion
}
```

**task_deleted**:
```json
{
  "task_id": "uuid",
  "deleted_task": { ... }  // Full task snapshot
}
```

### New Indexes

```sql
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
```

---

## Entity: Notification (New)

### Schema

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| user_id | VARCHAR(255) | INDEX, NOT NULL | Recipient user ID |
| message | TEXT | NOT NULL | Notification message |
| read | BOOLEAN | DEFAULT false, INDEX | Read status |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| task_id | UUID | FK → task.id, nullable, INDEX | Related task (optional) |

### Message Format

Reminder notifications follow this pattern:
```
"Reminder: {task_title} is due!"
```

Example: `"Reminder: Pay rent is due!"`

### New Indexes

```sql
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_task_id ON notifications(task_id);
```

---

## Relationships

### Entity Relationship Diagram

```
┌──────────────┐     parent_task_id     ┌──────────────┐
│   Task       │◄──────────────────────│   Task       │
│              │   (recurring chain)   │              │
└──────┬───────┘                       └──────────────┘
       │
       │ reminder_at, reminder_sent
       ▼
┌──────────────┐
│ Notification │  ┌──────────┐
│ (auto-create)│  │ AuditLog │
└──────────────┘  │ (all ops)│
                  └──────────┘
```

### Relationship Rules

1. **Task → Task (self-reference)**:
   - `parent_task_id` references `task.id`
   - ON DELETE SET NULL (orphaned instances kept)
   - A task can only have one parent

2. **Task → Notification**:
   - `task_id` references `task.id`
   - ON DELETE CASCADE (delete task → delete notifications)
   - A notification can have zero or one task

3. **Task → AuditLog**:
   - No direct foreign key (denormalized `entity_id`)
   - Application-level scoping by `user_id`
   - Audit logs never deleted via cascade

---

## SQLModel Definitions

### Task (Extended)

```python
from datetime import datetime, date
from typing import Optional, List
from uuid import UUID, uuid4
from sqlmodel import Field, SQLModel, Column
from sqlalchemy import JSON

class Task(SQLModel, table=True):
    # Existing fields...
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str = Field(min_length=1, max_length=200)
    # ... (other existing fields)

    # New fields
    recurring_rule: Optional[str] = Field(
        default=None,
        sa_column=Column("recurring_rule", VARCHAR(20))
    )
    recurring_end_date: Optional[datetime] = Field(default=None)
    parent_task_id: Optional[UUID] = Field(
        default=None,
        foreign_key="task.id"
    )
    reminder_at: Optional[datetime] = Field(default=None)
    reminder_sent: bool = Field(default=False)
    tags: List[str] = Field(
        default=[],
        sa_column=Column("tags", JSON, default=list)
    )
```

### AuditLog

```python
from enum import Enum
from typing import Dict, Any

class EventType(str, Enum):
    TASK_CREATED = "task_created"
    TASK_UPDATED = "task_updated"
    TASK_COMPLETED = "task_completed"
    TASK_DELETED = "task_deleted"

class AuditLog(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    event_type: EventType
    entity_type: str  # "task", "notification", etc.
    entity_id: UUID
    user_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    data: Dict[str, Any] = Field(default={})
```

### Notification

```python
class Notification(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: str
    message: str
    read: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    task_id: Optional[UUID] = Field(default=None, foreign_key="task.id")
```

---

## Data Migration Considerations

### Existing Data

When migration runs:
- Existing tasks get `tags = []` (empty array)
- Existing tasks get `reminder_sent = false`
- New fields are nullable, so no data loss

### Rollback Strategy

To rollback to Phase 4 (pre-010-features):
1. Drop new columns from task table
2. Drop audit_logs and notifications tables
3. Existing task data preserved

---

## Performance Characteristics

### Query Patterns

| Query | Index Used | Expected Performance |
|-------|-----------|---------------------|
| Get due reminders | `idx_task_reminder_at` | <10ms for 1000 tasks |
| Filter by tag | `idx_task_tags` (GIN) | <20ms for 1000 tasks |
| Get user audit log | `idx_audit_logs_user_id + timestamp` | <50ms for 1000 entries |
| Get unread notifications | `idx_notifications_user_id + read` | <10ms |

### Storage Estimates

- Per task overhead: ~100 bytes for new fields
- Per audit entry: ~200 bytes average
- Per notification: ~100 bytes average

For 10,000 users with 100 tasks each:
- Additional task storage: ~100MB
- Audit logs (assuming 5 ops/task): ~1GB
- Notifications (assuming 1/task): ~100MB
