-- ChatKit Integration Migration
-- Creates tables for thread persistence with snake_case naming convention

-- Drop existing tables if they exist
DROP TABLE IF EXISTS chatkit_thread_item CASCADE;
DROP TABLE IF EXISTS chatkit_thread CASCADE;

-- ChatKit threads table
CREATE TABLE chatkit_thread (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    thread_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chatkit_thread_user_id_check CHECK (user_id ~ '^[a-zA-Z0-9_-]+$')
);

-- ChatKit thread items table
CREATE TABLE chatkit_thread_item (
    id VARCHAR(255) PRIMARY KEY,
    thread_id VARCHAR(255) NOT NULL REFERENCES chatkit_thread(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'user_message', 'assistant_message', 'tool_call',
        'tool_result', 'system_message', 'error'
    )),
    content JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chatkit_thread_item_type_check CHECK (type ~ '^[a-z_]+$')
);

-- Performance indexes
CREATE INDEX idx_chatkit_thread_user ON chatkit_thread(user_id);
CREATE INDEX idx_chatkit_thread_updated ON chatkit_thread(updated_at);
CREATE INDEX idx_chatkit_item_thread ON chatkit_thread_item(thread_id);
CREATE INDEX idx_chatkit_item_created ON chatkit_thread_item(created_at);
CREATE INDEX idx_chatkit_item_type ON chatkit_thread_item(type);

-- Enable Row Level Security for user isolation
ALTER TABLE chatkit_thread ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatkit_thread_item ENABLE ROW LEVEL SECURITY;

-- Create policies for user isolation
CREATE POLICY chatkit_thread_policy ON chatkit_thread
    FOR ALL
    USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY chatkit_thread_item_policy ON chatkit_thread_item
    FOR ALL
    USING (
        thread_id IN (
            SELECT id FROM chatkit_thread
            WHERE user_id = current_setting('app.current_user_id', true)
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_chatkit_thread_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER chatkit_thread_updated_at_trigger
    BEFORE UPDATE ON chatkit_thread
    FOR EACH ROW
    EXECUTE FUNCTION update_chatkit_thread_updated_at();