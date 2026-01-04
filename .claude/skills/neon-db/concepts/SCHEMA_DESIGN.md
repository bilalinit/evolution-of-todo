# Schema Design Patterns for Neon PostgreSQL

## Column Naming Convention

> ⚠️ **IMPORTANT**: Use camelCase with double quotes for column names in PostgreSQL.

```sql
-- Correct (quoted camelCase)
CREATE TABLE "user" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Incorrect (unquoted - will be lowercased by PostgreSQL)
CREATE TABLE user (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,  -- This becomes 'userid'
    createdAt TIMESTAMP    -- This becomes 'createdat'
);
```

---

## Standard Table Structure

### User Table (Better Auth)

```sql
-- Better Auth creates this automatically, but for reference:
CREATE TABLE IF NOT EXISTS "user" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL UNIQUE,
    "emailVerified" BOOLEAN DEFAULT FALSE,
    "image" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Custom learning profile fields
    "educationLevel" TEXT,
    "programmingExperience" TEXT,
    "roboticsBackground" TEXT
);
```

### ChatKit Thread Table

```sql
CREATE TABLE IF NOT EXISTS "chatkit_thread" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Foreign key constraint for data isolation
    CONSTRAINT fk_chatkit_thread_user 
        FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);
```

### ChatKit Thread Item Table

```sql
CREATE TABLE IF NOT EXISTS "chatkit_thread_item" (
    "id" TEXT PRIMARY KEY,
    "threadId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Foreign key constraint to thread
    CONSTRAINT fk_chatkit_thread_item_thread 
        FOREIGN KEY ("threadId") REFERENCES "chatkit_thread"("id") ON DELETE CASCADE
);
```

---

## Index Design

Create indexes for:
1. Foreign keys (required for JOIN performance)
2. Frequently queried columns
3. Sorting columns

```sql
-- User lookup indexes
CREATE INDEX IF NOT EXISTS "idx_user_email" ON "user" ("email");

-- Thread indexes
CREATE INDEX IF NOT EXISTS "idx_chatkit_thread_user" ON "chatkit_thread" ("userId");
CREATE INDEX IF NOT EXISTS "idx_chatkit_thread_created" ON "chatkit_thread" ("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_chatkit_thread_updated" ON "chatkit_thread" ("updatedAt" DESC);

-- Thread item indexes
CREATE INDEX IF NOT EXISTS "idx_chatkit_item_thread" ON "chatkit_thread_item" ("threadId");
CREATE INDEX IF NOT EXISTS "idx_chatkit_item_created" ON "chatkit_thread_item" ("createdAt");
```

---

## JSONB for Metadata

Use JSONB for flexible metadata storage:

```sql
-- Store flexible metadata
"metadata" JSONB DEFAULT '{}'

-- Query JSONB fields
SELECT * FROM chatkit_thread 
WHERE metadata->>'title' ILIKE '%search%';

-- Update JSONB fields
UPDATE chatkit_thread 
SET metadata = metadata || '{"lastMessageDate": "2024-01-01T00:00:00Z"}'
WHERE id = $1;
```

---

## Automatic Timestamp Updates

Create a trigger for automatic `updatedAt`:

```sql
-- Create trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Attach to table
CREATE TRIGGER update_chatkit_thread_updated_at
    BEFORE UPDATE ON "chatkit_thread"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## Foreign Key Constraints

Always use `ON DELETE CASCADE` for dependent data:

```sql
-- When user is deleted, delete all their threads
CONSTRAINT fk_chatkit_thread_user 
    FOREIGN KEY ("userId") REFERENCES "user"("id") 
    ON DELETE CASCADE

-- When thread is deleted, delete all its items
CONSTRAINT fk_chatkit_thread_item_thread 
    FOREIGN KEY ("threadId") REFERENCES "chatkit_thread"("id") 
    ON DELETE CASCADE
```

---

## Migration File Pattern

Name migrations with sequence numbers:

```
backend/migrations/
├── 001_create_auth_tables.sql
├── 002_create_chat_history.sql
├── 003_create_chatkit_tables.sql
└── migrate.py
```

Each migration should be idempotent using `IF NOT EXISTS`:

```sql
-- 003_create_chatkit_tables.sql
-- Description: Create ChatKit tables for persistent storage

CREATE TABLE IF NOT EXISTS "chatkit_thread" (
    -- columns...
);

CREATE INDEX IF NOT EXISTS "idx_chatkit_thread_user" 
    ON "chatkit_thread" ("userId");
```
