# Neon DB for Claude

## When to Use This Skill
Use this skill when users ask about:
- **Database Setup**: Connecting to Neon PostgreSQL from TypeScript or Python
- **Connection Pooling**: Configuring pool settings, SSL, timeouts
- **Schema Design**: Creating tables, indexes, foreign keys, triggers
- **User Isolation**: Multi-tenant patterns with userId filtering
- **Migrations**: Writing and running database migrations
- **Debugging**: SSL errors, connection failures, query issues

## How to Respond
1. **Identify Language**: TypeScript/Node.js or Python?
2. **Check Integration**: Better Auth, ChatKit, or standalone?
3. **Check Environment**: SSL required for Neon (always)
4. **Use Patterns**: Follow exact patterns from concepts/ files

## Key Concepts

### Connection String
```bash
# Format (always use sslmode=require for Neon)
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
```

### TypeScript (pg Pool)
- **SSL Required**: `ssl: { rejectUnauthorized: false }` for Neon
- **Pool Settings**: max, idleTimeoutMillis, connectionTimeoutMillis
- **Error Handling**: Use pool events (`on('error')`, `on('connect')`)
- **Export Pattern**: Export pool for use across modules

### Python (psycopg2)
- **Context Manager**: Use `@contextmanager` for connection cleanup
- **SSL Mode**: `sslmode='require'` in connection string
- **RealDictCursor**: For dict-like row access
- **User Isolation**: Extract user_id from context for data filtering

## Import Paths (Correct)

```typescript
// TypeScript
import { Pool } from 'pg';
```

```python
# Python
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
```

## Common Mistakes to Watch For
- Missing SSL configuration (Neon requires SSL)
- Not using connection pooling (creating new connections per request)
- Forgetting to close connections (use context managers in Python)
- Wrong column name casing (use quotes for camelCase: `"userId"`)
- Missing foreign key constraints for data integrity
- Not handling pool errors in Node.js

## Framework-Specific Guidance

### Better Auth (TypeScript)
- Pass the pool directly to `betterAuth({ database: pool })`
- Neon handles user table creation automatically
- Add custom fields via `user.additionalFields`

### ChatKit NeonStore (Python)
- Implement all 14 Store abstract methods
- Use `_get_user_id_from_context()` for isolation
- Store JSON metadata in JSONB columns
- Use `model_dump()` for ChatKit item serialization

## Schema Conventions
- **Columns**: camelCase with quotes (`"userId"`, `"createdAt"`)
- **Tables**: snake_case or descriptive prefixes (`chatkit_thread`)
- **Timestamps**: `TIMESTAMP WITH TIME ZONE DEFAULT NOW()`
- **JSONB**: For flexible metadata storage
- **Indexes**: On foreign keys and frequently queried columns

## File Reference
- `concepts/TYPESCRIPT_PATTERNS.md` - Node.js pool patterns
- `concepts/PYTHON_PATTERNS.md` - psycopg2 patterns
- `concepts/SCHEMA_DESIGN.md` - Table and migration design
- `references/API_REFERENCE.md` - API signatures
- `references/ENVIRONMENT_VARIABLES.md` - DATABASE_URL config

## Refusal Criteria
- Do not suggest connections without SSL for Neon
- Do not skip connection cleanup patterns
- Do not use unquoted camelCase column names in SQL
