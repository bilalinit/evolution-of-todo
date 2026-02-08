# Quickstart: Advanced Task Features

**Branch**: `010-features` | **Date**: 2026-02-02

## Overview

This guide helps you set up and test the Advanced Task Features (recurring tasks, reminders, tags, audit trail) in the monolithic todo app.

## Prerequisites

- Python 3.12+
- Node.js 20+
- Neon PostgreSQL account (SSL required)
- Existing Phase 4 codebase

---

## Step 1: Database Migration

### 1.1 Review Migration SQL

```bash
cat phase-5/backend/migrations/002_phase5_features.sql
```

### 1.2 Run Migration

**Option A: Via psql**
```bash
psql $DATABASE_URL -f phase-5/backend/migrations/002_phase5_features.sql
```

**Option B: Via Python script**
```bash
cd phase-5/backend
python -c "
import psycopg2
import os
from dotenv import load_dotenv
load_dotenv()

conn = psycopg2.connect(os.environ['DATABASE_URL'], sslmode='require')
cursor = conn.cursor()

with open('migrations/002_phase5_features.sql', 'r') as f:
    sql = f.read()
    cursor.execute(sql)
    conn.commit()

cursor.close()
conn.close()
print('Migration complete!')
"
```

### 1.3 Verify Migration

```sql
-- Check new columns
\d task

-- Check new tables
SELECT * FROM audit_logs LIMIT 1;
SELECT * FROM notifications LIMIT 1;

-- Check indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'task';
```

Expected output:
- `task` table has new columns: `recurring_rule`, `recurring_end_date`, `parent_task_id`, `reminder_at`, `reminder_sent`, `tags`
- `audit_logs` and `notifications` tables exist
- Indexes: `idx_task_recurring_rule`, `idx_task_reminder_at`, `idx_task_tags`, etc.

---

## Step 2: Backend Setup

### 2.1 Install Dependencies

```bash
cd phase-5/backend
uv add python-dateutil
```

### 2.2 Verify Backend Files

Ensure these files exist:
- `src/backend/models/audit_log.py` (NEW)
- `src/backend/models/notification.py` (NEW)
- `src/backend/services/reminder_service.py` (NEW)
- `src/backend/services/audit_service.py` (NEW)
- `src/backend/services/notification_service.py` (NEW)
- `src/backend/routes/notifications.py` (NEW)
- `src/backend/routes/audit.py` (NEW)
- `src/backend/models/task.py` (MODIFIED)
- `src/backend/services/task_service.py` (MODIFIED)
- `src/backend/routes/tasks.py` (MODIFIED)
- `src/backend/main.py` (MODIFIED)

### 2.3 Start Backend

```bash
uv run python -m backend.main
```

Expected output:
```
✅ Database initialized
✅ Agent system ready
✅ MCP tools configured
✅ ChatKit store and server initialized
✅ Reminder scheduler started
```

---

## Step 3: Frontend Setup

### 3.1 Install Dependencies

```bash
cd phase-5/frontend
npm install
```

### 3.2 Verify Frontend Files

Ensure these files exist:
- `src/components/tasks/TagBadge.tsx` (NEW)
- `src/components/notifications/NotificationPanel.tsx` (NEW)
- `src/components/notifications/NotificationItem.tsx` (NEW)
- `src/components/tasks/TaskForm.tsx` (MODIFIED)
- `src/components/tasks/TaskItem.tsx` (MODIFIED)
- `src/components/layout/Header.tsx` (MODIFIED)
- `src/types/task.ts` (MODIFIED)

### 3.3 Start Frontend

```bash
npm run dev
```

---

## Step 4: Run Tests

### 4.1 Backend Tests

```bash
cd phase-5/backend
uv run pytest tests/test_phase5_features.py -v
```

Expected tests:
- `test_recurring_task_creation`
- `test_recurring_task_completion_creates_next_instance`
- `test_recurring_end_date_stops_generation`
- `test_reminder_notification_created`
- `test_missed_reminder_recovery`
- `test_tag_filtering`
- `test_audit_log_task_created`
- `test_audit_log_task_updated`
- `test_audit_log_task_completed`
- `test_audit_log_task_deleted`

### 4.2 Frontend Tests

```bash
cd phase-5/frontend
npm test
```

---

## Step 5: Manual Testing

### 5.1 Test Recurring Tasks

1. Create a daily recurring task:
   - Title: "Daily Standup"
   - Due date: Today
   - Recurring rule: Daily
   - No end date

2. Complete the task

3. Verify: A new task is created with tomorrow's due date

4. Check database:
```sql
SELECT id, title, due_date, parent_task_id, recurring_rule
FROM task
WHERE title = 'Daily Standup'
ORDER BY created_at;
```

Expected: Two rows - original (completed) and new instance.

### 5.2 Test Reminders

1. Create a task with reminder:
   - Title: "Meeting Reminder"
   - Due date: Tomorrow
   - Reminder at: 1 minute from now

2. Wait 60 seconds

3. Check notification panel (bell icon in header)

4. Verify notification appears: "Reminder: Meeting Reminder is due!"

5. Check database:
```sql
SELECT * FROM notifications WHERE user_id = 'your-user-id';
```

Expected: One notification with `read = false`.

### 5.3 Test Tags

1. Create a task with tags:
   - Title: "Urgent Bug Fix"
   - Tags: `urgent, bug, frontend`

2. Create another task with tag `urgent`

3. Use tag filter to show only urgent tasks

4. Check database:
```sql
SELECT title, tags FROM task WHERE tags @> '["urgent"]'::jsonb;
```

Expected: Both tasks returned.

### 5.4 Test Audit Log

1. Create a task

2. Update the task

3. Complete the task

4. Delete the task

5. Check audit endpoint:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/YOUR_USER_ID/audit
```

Expected: 4 audit entries (created, updated, completed, deleted).

### 5.5 Test Missed Reminder Recovery

1. Create a task with reminder in the past:
   - Reminder at: 5 minutes ago

2. Restart backend

3. Verify: Notification appears within 30 seconds of startup

---

## Step 6: Verify MCP Tools

### 6.1 Test Recurring Task Creation

```bash
# Via chat endpoint
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message": "Create a daily recurring task called Morning Jog"}'
```

Expected: Task created with `recurring_rule: "daily"`.

### 6.2 Verify MCP Tool Schema

Check that MCP tools accept new fields:
- `create_task`: `recurring_rule`, `recurring_end_date`, `reminder_at`, `tags`
- `update_task`: Same fields

---

## Troubleshooting

### Reminder scheduler not starting

**Symptom**: No "✅ Reminder scheduler started" message

**Solution**:
1. Check `main.py` lifespan includes `reminder_service.start()`
2. Verify `ReminderService` imported correctly
3. Check for asyncio errors in logs

### Tags not filtering

**Symptom**: Tag filter returns no results

**Solution**:
1. Verify GIN index exists: `SELECT * FROM pg_indexes WHERE indexname = 'idx_task_tags';`
2. Check tags format in database: Should be `["tag1", "tag2"]` not `"tag1,tag2"`
3. Test query manually: `SELECT * FROM task WHERE tags @> '["urgent"]'::jsonb;`

### Audit logs not appearing

**Symptom**: Audit endpoint returns empty array

**Solution**:
1. Check audit service is called in routes
2. Verify `user_id` matches authenticated user
3. Check database: `SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 10;`

### Timezone issues

**Symptom**: Reminders fire at wrong time

**Solution**:
1. Verify `reminder_at` stored in UTC
2. Check frontend converts to user timezone for display
3. Test with explicit UTC: `datetime.now(timezone.utc)`

---

## Performance Testing

### Load Test: Reminders

Create 100 tasks with reminders, verify scheduler handles load:

```python
import asyncio
from datetime import datetime, timedelta, timezone

async def create_test_reminders():
    now = datetime.now(timezone.utc)
    for i in range(100):
        reminder_time = now + timedelta(seconds=i*10)  # Spread over 16 minutes
        # Create task with reminder_at = reminder_time
```

Expected: All 100 reminders processed within 2 minutes of their due time.

### Load Test: Tags

Create 1000 tasks with 50 unique tags, test filter performance:

```python
import random

tags = [f"tag{i}" for i in range(50)]
for i in range(1000):
    task_tags = random.sample(tags, 5)  # 5 random tags per task
    # Create task with tags
```

Expected: Tag filter returns results in <500ms.

---

## Next Steps

After successful testing:

1. Run full test suite: `pytest tests/`
2. Run manual QA checklist
3. Create pull request to main
4. Proceed to branch 011-microservices-docker (next in Phase V)

---

## Rollback Procedure

If migration fails:

```sql
-- Drop new columns
ALTER TABLE task DROP COLUMN IF EXISTS recurring_rule;
ALTER TABLE task DROP COLUMN IF EXISTS recurring_end_date;
ALTER TABLE task DROP COLUMN IF EXISTS parent_task_id;
ALTER TABLE task DROP COLUMN IF EXISTS reminder_at;
ALTER TABLE task DROP COLUMN IF EXISTS reminder_sent;
ALTER TABLE task DROP COLUMN IF EXISTS tags;

-- Drop new tables
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS audit_logs;

-- Drop new indexes (automatically dropped with columns/tables)
```

Then revert code changes:
```bash
git checkout main
```
