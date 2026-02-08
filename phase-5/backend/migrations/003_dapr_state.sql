-- Dapr State Store table for distributed state management
-- This table is used by Dapr's PostgreSQL state store component
-- for idempotency tracking and other distributed state needs

CREATE TABLE IF NOT EXISTS state (
    key TEXT PRIMARY KEY,
    value JSONB,
    isbinary BOOLEAN DEFAULT FALSE,
    insertdate TIMESTAMP DEFAULT NOW(),
    updatedate TIMESTAMP DEFAULT NOW()
);

-- Create index for faster lookups by key prefix
CREATE INDEX IF NOT EXISTS idx_state_key_prefix ON state (key text_pattern_ops);

-- Create index for updated timestamp queries
CREATE INDEX IF NOT EXISTS idx_state_updatedate ON state (updatedate);

-- Add comment for documentation
COMMENT ON TABLE state IS 'Dapr State Store table for distributed key-value storage';
COMMENT ON COLUMN state.key IS 'Unique key for the state value (format: processed-{event_id}-{service_name} for idempotency)';
COMMENT ON COLUMN state.value IS 'JSONB value stored for the key';
COMMENT ON COLUMN state.isbinary IS 'Dapr internal flag (always FALSE for this use case)';
COMMENT ON COLUMN state.insertdate IS 'Timestamp when the key was first inserted';
COMMENT ON COLUMN state.updatedate IS 'Timestamp when the key was last updated';
