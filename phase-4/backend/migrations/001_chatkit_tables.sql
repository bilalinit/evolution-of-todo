-- ChatKit Integration Migration
-- Creates tables for thread persistence and session management
-- Run this SQL in your Neon PostgreSQL console or via migration tool

-- ChatKit threads table
CREATE TABLE IF NOT EXISTS chatkit_thread (
    id VARCHAR(255) PRIMARY KEY,
    "userId" VARCHAR(255) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "threadMetadata" JSONB DEFAULT '{}'::jsonb,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chatkit_thread_user_id_check CHECK ("userId" ~ '^[a-zA-Z0-9_-]+$')
);

-- ChatKit thread items table
CREATE TABLE IF NOT EXISTS chatkit_thread_item (
    id VARCHAR(255) PRIMARY KEY,
    "threadId" VARCHAR(255) NOT NULL REFERENCES chatkit_thread(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'user_message', 'assistant_message', 'tool_call',
        'tool_result', 'system_message', 'error'
    )),
    content JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chatkit_thread_item_type_check CHECK (type ~ '^[a-z_]+$')
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_chatkit_thread_user ON chatkit_thread("userId");
CREATE INDEX IF NOT EXISTS idx_chatkit_thread_updated ON chatkit_thread("updatedAt");
CREATE INDEX IF NOT EXISTS idx_chatkit_item_thread ON chatkit_thread_item("threadId");
CREATE INDEX IF NOT EXISTS idx_chatkit_item_created ON chatkit_thread_item("createdAt");
CREATE INDEX IF NOT EXISTS idx_chatkit_item_type ON chatkit_thread_item(type);

-- Enable Row Level Security for user isolation
ALTER TABLE chatkit_thread ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatkit_thread_item ENABLE ROW LEVEL SECURITY;

-- Create policies for user isolation
CREATE POLICY chatkit_thread_policy ON chatkit_thread
    FOR ALL
    USING ("userId" = current_setting('app.current_user_id', true));

CREATE POLICY chatkit_thread_item_policy ON chatkit_thread_item
    FOR ALL
    USING (
        "threadId" IN (
            SELECT id FROM chatkit_thread
            WHERE "userId" = current_setting('app.current_user_id', true)
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_chatkit_thread_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER chatkit_thread_updated_at_trigger
    BEFORE UPDATE ON chatkit_thread
    FOR EACH ROW
    EXECUTE FUNCTION update_chatkit_thread_updated_at();

-- Verification queries
-- Check tables were created
-- \dt chatkit_*

-- Check indexes
-- \d chatkit_thread
-- \d chatkit_thread_item

-- Test user isolation (replace 'test_user_id' with actual user ID)
-- SET app.current_user_id = 'test_user_id';
-- SELECT * FROM chatkit_thread;
-- SELECT * FROM chatkit_thread_item;