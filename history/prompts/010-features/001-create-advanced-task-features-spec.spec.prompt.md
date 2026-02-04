---
id: "001"
title: "create advanced task features spec"
stage: spec
date: 2026-02-02
surface: agent
model: claude-opus-4-5-20251101
feature: 010-features
branch: 010-features
user: architext
command: /sp.specify
labels: [features, recurring-tasks, reminders, tags, audit-trail]
links:
  spec: specs/010-features/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/010-features/spec.md
  - specs/010-features/checklists/requirements.md
tests:
  - Specification quality validation (PASSED)
---

## Prompt

name the new branch "010-features" and here are the specs :

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Recurring Tasks (Priority: P1)

Users can create tasks that automatically repeat on a schedule (daily, weekly, monthly, yearly) without manually recreating them each time.

**Why this priority**: This is the core advanced feature that differentiates the todo app from basic CRUD. It provides immediate value by reducing repetitive manual work.

**Independent Test**: Can be fully tested by creating a recurring task, marking it complete, and verifying the next instance is automatically created with the correct due date.

**Acceptance Scenarios**:

1. **Given** a user is creating a new task, **When** they select "Daily" from the recurring dropdown, **Then** the task should be saved with `recurring_rule: "daily"`
2. **Given** a recurring task with `recurring_rule: "weekly"` and due date of Monday, **When** the user marks it complete, **Then** a new task should be created with due date of next Monday
3. **Given** a recurring task with `recurring_end_date` set, **When** a task completion would create an instance past the end date, **Then** no new instance should be created
4. **Given** a recurring task instance, **When** viewing the task, **Then** a recurring indicator (🔄) should be visible
5. **Given** a user sets a monthly recurring task "Pay rent" with end date of December 31, 2025, **When** they complete the January instance, **Then** a February instance should be created, but no instance after December 2025

---

### User Story 2 - Due Dates & Reminders (Priority: P2)

Users can set due dates and optional reminder times for tasks, and receive in-app notifications when reminders are due.

**Why this priority**: Reminders are critical for task completion and user engagement. While the notification system will be fully implemented in later branches, the data model and UI should be in place first.

**Independent Test**: Can be tested by creating a task with a `reminder_at` time in the near future, waiting for that time, and verifying a notification is created in the database.

**Scope Note**: In branch 010-features (monolithic), reminder triggering uses a simple asyncio background task that polls the database every minute. In branch 012-dapr-kafka, this will be upgraded to Dapr Jobs API for precise, event-driven scheduling.

**Acceptance Scenarios**:

1. **Given** a user is creating a task, **When** they set a due date of tomorrow and a reminder for 1 hour before, **Then** the task should be saved with `due_date` and `reminder_at` fields populated
2. **Given** a task with `reminder_at` of 9:00 AM today, **When** the background scheduler runs at 9:00 AM (or shortly after), **Then** a notification record should be created in the database with `message: "Reminder: [task title] is due!"`
3. **Given** a reminder notification has been created, **When** the user views the notification panel, **Then** the notification should be displayed with a bell icon and unread count badge
4. **Given** a notification that has been sent, **When** checking the task, **Then** `reminder_sent` should be `true` to prevent duplicate reminders
5. **Given** a user marks a notification as read, **When** they refresh the notification panel, **Then** the unread count should decrease
6. **Given** the server was down and missed scheduled reminders, **When** the server restarts, **Then** the background scheduler should process any missed reminders (where `reminder_at` < now and `reminder_sent` = false) on startup

---

### User Story 3 - Tags (Priority: P3)

Users can add custom labels/tags to tasks for organization and filtering (e.g., "urgent", "meeting", "followup").

**Why this priority**: Tags enhance organization and are an intermediate feature mentioned in requirements. They complement the existing priority and category fields.

**Independent Test**: Can be tested by creating a task with multiple tags, then filtering/searching by those tags to verify the task appears in results.

**Acceptance Scenarios**:

1. **Given** a user is creating a task, **When** they enter tags "urgent, meeting", **Then** the task should be saved with `tags: ["urgent", "meeting"]`
2. **Given** a task with tags displayed, **When** viewing the task card, **Then** tags should be shown as colored badges/pills
3. **Given** a user has multiple tasks with various tags, **When** they click on a tag filter, **Then** only tasks with that tag should be displayed
4. **Given** a user is editing a task, **When** they add or remove tags, **Then** the task's tags should update accordingly
5. **Given** the search input, **When** a user searches for "meeting", **Then** tasks with "meeting" in title, description, OR tags should appear

---

### User Story 4 - Audit Trail (Priority: P4)

All task operations (create, update, delete, complete) are logged with timestamps, user context, and data snapshots.

**Why this priority**: Audit logging is important for data integrity, debugging, and compliance. It's foundational for the event-driven architecture in later branches.

**Independent Test**: Can be tested by performing various task operations and then querying the audit log to verify each operation was captured.

**Acceptance Scenarios**:

1. **Given** a user creates a new task, **When** the operation completes, **Then** an audit log entry should exist with `event_type: "task_created"`, the task ID, user ID, timestamp, and task data
2. **Given** a user updates a task title, **When** the operation completes, **Then** an audit log entry should exist with `event_type: "task_updated"` and the changed data
3. **Given** a user completes a task, **When** the operation completes, **Then** an audit log entry should exist with `event_type: "task_completed"` and the task state before completion
4. **Given** a user deletes a task, **When** the operation completes, **Then** an audit log entry should exist with `event_type: "task_deleted"` and a snapshot of the deleted task
5. **Given** a user views their audit log, **When** they request the audit endpoint, **Then** they should see a chronological list of their actions with timestamps

---

### Edge Cases

- What happens when a user tries to set a `recurring_end_date` that is before the initial `due_date`? (Validation should prevent this)
- What happens when a recurring task has no `due_date` set? (Should require due_date for recurring tasks)
- What happens when `reminder_at` is set in the past? (Should validate or create notification immediately)
- What happens when a user sets a reminder for a one-time task vs a recurring task? (One-time reminder vs reminder per instance)
- What happens when tags contain special characters or are very long? (Should sanitize or validate)
- What happens when the database connection fails during audit logging? (Should not block main operation, log asynchronously if possible)
- What happens when a recurring task is deleted? (Should all future instances be cancelled or just the current one?)
- What happens when timezone changes affect a recurring task's due time? (Should store in UTC and display in user's timezone)
- What happens when the server is down during a scheduled reminder time? (Should process missed reminders on startup)

## Scope Boundary

### IN Scope for 010-features (Monolithic Architecture)

| Feature | Implementation Approach |
|---------|------------------------|
| **Database Schema** | Add all new fields (recurring, reminder, tags) to Task model + new AuditLog/Notification tables |
| **Recurring Task Logic** | Backend methods: `calculate_next_due_date()`, `create_next_recurring_task()` - synchronous execution |
| **Reminder Data Model** | Store `reminder_at`, `reminder_sent` fields |
| **Reminder Triggering** | Simple asyncio background task polling every minute |
| **Notification Panel UI** | Bell icon, unread count, dropdown list, mark-as-read |
| **Tag Support** | JSONB array storage, badge display, filter by tag |
| **Audit Logging** | Synchronous write to audit_logs table on each operation |
| **MCP Tools Update** | Add new fields to `create_task` and `update_task` tools |
| **API Endpoints** | GET/POST notifications, GET audit, extend task endpoints |

### OUT of Scope for 010-features (Deferred to Later Branches)

| Feature | Deferred to Branch | Reason |
|---------|-------------------|--------|
| **Event Publishing** | 012-dapr-kafka | Requires Dapr Pub/Sub component |
| **Dapr Jobs API** | 012-dapr-kafka | Requires Dapr installation |
| **Microservices Split** | 011-microservices-docker | Architecture split happens in next branch |
| **Async Audit Logging** | 012-dapr-kafka | Event-driven architecture enables async |
| **Reminder Email/Push** | Future | Out of scope for Phase V |
| **Real-time Sync** | 012-dapr-kafka | WebSocket service consumes task-updates topic |

### Migration Path to Branch 012-dapr-kafka

When migrating from 010-features to 012-dapr-kafka:
- Reminder triggering: asyncio background task → Dapr Jobs API
- Audit logging: synchronous DB write → Event publishing via Dapr Pub/Sub
- Database access: direct queries → Dapr State Management (optional)
- Monolithic backend → Split into 5 backend microservices (backend-api, recurring-service, notification-service, audit-service, websocket-service)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create recurring tasks with rules: daily, weekly, monthly, yearly
- **FR-002**: System MUST calculate next occurrence dates correctly for each recurring rule
- **FR-003**: System MUST stop creating recurring instances after `recurring_end_date` is reached
- **FR-004**: System MUST link all recurring task instances via `parent_task_id` for tracking
- **FR-005**: System MUST allow users to set optional `reminder_at` datetime for any task
- **FR-006**: System MUST create notification records when reminder time is reached (010-features: via asyncio background task polling every minute; 012-dapr-kafka: via Dapr Jobs API)
- **FR-006a**: System MUST run an asyncio background task that checks for due reminders every minute
- **FR-006b**: System MUST process any missed reminders on scheduler startup (where `reminder_at` < now and `reminder_sent` = false)
- **FR-007**: System MUST track `reminder_sent` flag to prevent duplicate notifications
- **FR-008**: System MUST allow users to add multiple tags to tasks as an array of strings
- **FR-009**: System MUST display tags as visual badges on task cards
- **FR-010**: System MUST support filtering tasks by tags
- **FR-011**: System MUST log all task operations (create, update, delete, complete) to audit table
- **FR-012**: System MUST include user ID, timestamp, and data snapshot in each audit log entry
- **FR-013**: System MUST provide API endpoint for users to retrieve their audit log
- **FR-014**: System MUST provide API endpoint for users to retrieve their notifications
- **FR-015**: System MUST allow users to mark notifications as read
- **FR-016**: System MUST validate that `recurring_end_date` is after initial `due_date`
- **FR-017**: System MUST require `due_date` to be set when `recurring_rule` is selected
- **FR-018**: MCP tools MUST support creating tasks with recurring and reminder fields
- **FR-019**: Frontend MUST display recurring indicator (🔄) on recurring tasks
- **FR-020**: Frontend MUST display reminder indicator (🔔) on tasks with reminders

### Key Entities

- **Task**: Extended with recurring fields (`recurring_rule`, `recurring_end_date`, `parent_task_id`), reminder fields (`reminder_at`, `reminder_sent`), and tags array
- **AuditLog**: Records all task operations with `event_type`, `entity_type`, `entity_id`, `user_id`, `timestamp`, and `data` (JSON snapshot)
- **Notification**: User notifications with `id`, `user_id`, `message`, `read` flag, `created_at`, and optional `task_id` reference

### Database Schema Changes

**Task Model Extensions:**
```sql
ALTER TABLE task ADD COLUMN IF NOT EXISTS recurring_rule VARCHAR(20);
ALTER TABLE task ADD COLUMN IF NOT EXISTS recurring_end_date TIMESTAMPTZ;
ALTER TABLE task ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES task(id) ON DELETE SET NULL;
ALTER TABLE task ADD COLUMN IF NOT EXISTS reminder_at TIMESTAMPTZ;
ALTER TABLE task ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE task ADD COLUMN IF NOT EXISTS tags JSONB;

CREATE INDEX IF NOT EXISTS idx_task_recurring_rule ON task(recurring_rule);
CREATE INDEX IF NOT EXISTS idx_task_reminder_at ON task(reminder_at);
CREATE INDEX IF NOT EXISTS idx_task_parent_task_id ON task(parent_task_id);
```

**New AuditLog Table:**
```sql
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
```

**New Notification Table:**
```sql
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

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a recurring task in under 30 seconds using the UI
- **SC-002**: Completing a recurring task results in the next instance being created within 1 second
- **SC-003**: Reminder notifications are created within 60 seconds of the reminder time being reached (010-features: background task polls every minute; 012-dapr-kafka: upgraded to Dapr Jobs API for <5 second precision)
- **SC-004**: Audit log captures 100% of task operations with complete data snapshots
- **SC-005**: Users can filter tasks by tags and see results in under 500ms
- **SC-006**: Database migration runs successfully in under 10 seconds
- **SC-007**: Notification panel displays notifications with unread count badge visible at all times
- **SC-008**: Recurring indicator and reminder indicator are clearly visible on all applicable tasks
- **SC-009**: MCP tools can create recurring tasks with the same success rate as regular tasks (>99%)
- **SC-010**: Frontend form validation prevents invalid recurring task configurations (e.g., end date before due date)
- **SC-011**: Background scheduler starts on application startup and processes any missed reminders within 30 seconds of startup

## Response snapshot

Successfully created feature specification for "Advanced Task Features" on branch `010-features`.

**Branch**: `010-features`
**Spec File**: `specs/010-features/spec.md`

**Specification Summary**:
- **4 User Stories** with priorities P1-P4:
  1. Recurring Tasks (P1) - Daily/weekly/monthly/yearly task repetition
  2. Due Dates & Reminders (P2) - In-app notifications for task reminders
  3. Tags (P3) - Custom labels for task organization
  4. Audit Trail (P4) - Complete logging of all task operations

- **20 Functional Requirements** (FR-001 through FR-020)
- **11 Success Criteria** with measurable outcomes
- **9 Edge Cases** documented
- **Clear Scope Boundaries** with IN/OUT scope tables and migration path

**Validation Status**: PASSED
All quality checklist items validated successfully. No [NEEDS CLARIFICATION] markers present. Specification is complete and ready for planning.

## Outcome

- ✅ Impact: Created comprehensive feature specification for 4 advanced task features (recurring tasks, reminders, tags, audit trail) with clear user stories, acceptance criteria, functional requirements, and success metrics
- 🧪 Tests: Specification quality validation completed - all items PASSED (content quality, requirement completeness, feature readiness)
- 📁 Files: specs/010-features/spec.md, specs/010-features/checklists/requirements.md
- 🔁 Next prompts: `/sp.plan` to create architecture plan, or `/sp.tasks` to generate actionable tasks
- 🧠 Reflection: User provided exceptionally comprehensive and well-structured specification content directly, making the spec creation process straightforward. All user stories are independently testable with clear priorities. Edge cases are thoroughly considered including timezone handling, server downtime scenarios, and data validation.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Specification Quality Checklist - PASSED (all items)
- Prompt variant (if applicable): None
- Next experiment (smallest change to try): None - spec is complete and ready for planning phase
