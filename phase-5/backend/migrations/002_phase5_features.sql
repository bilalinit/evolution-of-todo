-- Migration: 002_phase5_features.sql
-- Purpose: Add advanced task features (recurring tasks, reminders, tags, audit trail)
-- Branch: 010-features
-- Date: 2026-02-02

-- ==================== Task Table Extensions ====================

-- Add recurring task fields
ALTER TABLE task ADD COLUMN IF NOT EXISTS recurring_rule VARCHAR(20);
ALTER TABLE task ADD COLUMN IF NOT EXISTS recurring_end_date TIMESTAMPTZ;
ALTER TABLE task ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES task(id) ON DELETE SET NULL;

-- Add reminder fields
ALTER TABLE task ADD COLUMN IF NOT EXISTS reminder_at TIMESTAMPTZ;
ALTER TABLE task ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE;

-- Add tags field (JSONB for efficient querying)
ALTER TABLE task ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;

-- Add constraints for recurring tasks
ALTER TABLE task ADD CONSTRAINT chk_recurring_requires_due
    CHECK (
        recurring_rule IS NULL OR
        (recurring_rule IS NOT NULL AND due_date IS NOT NULL)
    );

ALTER TABLE task ADD CONSTRAINT chk_recurring_end_after_due
    CHECK (
        recurring_end_date IS NULL OR
        due_date IS NULL OR
        (recurring_end_date > due_date)
    );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_recurring_rule ON task(recurring_rule);
CREATE INDEX IF NOT EXISTS idx_task_reminder_at ON task(reminder_at);
CREATE INDEX IF NOT EXISTS idx_task_parent_task_id ON task(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_task_tags ON task USING GIN (tags);

-- ==================== Audit Logs Table ====================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    data JSONB DEFAULT '{}'::jsonb
);

-- Add comment for documentation
COMMENT ON TABLE audit_logs IS 'Audit trail for all task operations';

-- Add indexes for audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);

-- ==================== Notifications Table ====================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    task_id UUID REFERENCES task(id) ON DELETE CASCADE
);

-- Add comment for documentation
COMMENT ON TABLE notifications IS 'In-app notifications for task reminders and system events';

-- Add indexes for notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_task_id ON notifications(task_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- ==================== Migration Validation ====================

-- Verify all columns exist
DO $$
BEGIN
    -- Verify task table extensions
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'task' AND column_name = 'recurring_rule'
    ) THEN
        RAISE EXCEPTION 'Migration failed: recurring_rule column not found';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'task' AND column_name = 'tags'
    ) THEN
        RAISE EXCEPTION 'Migration failed: tags column not found';
    END IF;

    -- Verify audit_logs table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        RAISE EXCEPTION 'Migration failed: audit_logs table not found';
    END IF;

    -- Verify notifications table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        RAISE EXCEPTION 'Migration failed: notifications table not found';
    END IF;

    RAISE NOTICE 'Migration 002_phase5_features completed successfully';
END $$;
