# Neon PostgreSQL API Reference

## TypeScript (pg Pool)

### Pool Constructor

```typescript
import { Pool, PoolConfig } from 'pg';

const pool = new Pool(config: PoolConfig);
```

#### PoolConfig Options

| Option | Type | Description |
|--------|------|-------------|
| `connectionString` | string | Full connection URL |
| `host` | string | Database host |
| `port` | number | Database port (5432) |
| `database` | string | Database name |
| `user` | string | Username |
| `password` | string | Password |
| `ssl` | boolean \| object | SSL configuration |
| `max` | number | Maximum pool size |
| `idleTimeoutMillis` | number | Idle connection timeout |
| `connectionTimeoutMillis` | number | Connection timeout |

### Pool Methods

```typescript
// Execute a query
const result = await pool.query(text: string, values?: any[]): Promise<QueryResult>

// Get a client from the pool
const client = await pool.connect(): Promise<PoolClient>

// End the pool (close all connections)
await pool.end(): Promise<void>
```

### QueryResult

```typescript
interface QueryResult<R = any> {
  rows: R[];
  rowCount: number;
  command: string;
  fields: FieldDef[];
}
```

### Pool Events

```typescript
pool.on('connect', (client: PoolClient) => void)
pool.on('error', (err: Error, client: PoolClient) => void)
pool.on('remove', (client: PoolClient) => void)
```

---

## Python (psycopg2)

### Connection

```python
import psycopg2

conn = psycopg2.connect(
    dsn: str,           # Connection string
    host: str,          # Database host
    port: int,          # Database port
    dbname: str,        # Database name
    user: str,          # Username
    password: str,      # Password
    sslmode: str,       # SSL mode ('require' for Neon)
)
```

### Connection Methods

```python
# Create a cursor
cursor = conn.cursor()
cursor = conn.cursor(cursor_factory=RealDictCursor)

# Transaction control
conn.commit()
conn.rollback()

# Close connection
conn.close()
```

### Cursor Methods

```python
# Execute a query
cursor.execute(query: str, vars: tuple | None = None)

# Fetch results
row = cursor.fetchone()       # Single row or None
rows = cursor.fetchall()      # All rows as list
rows = cursor.fetchmany(n)    # n rows as list

# Row count
count = cursor.rowcount       # Rows affected by last operation
```

### RealDictCursor

```python
from psycopg2.extras import RealDictCursor

cursor = conn.cursor(cursor_factory=RealDictCursor)
cursor.execute("SELECT id, name FROM user")
row = cursor.fetchone()
# row = {'id': '123', 'name': 'John'}
```

---

## SQL Query Patterns

### Parameterized Queries

```typescript
// TypeScript - use $1, $2, etc.
await pool.query(
  'SELECT * FROM "user" WHERE id = $1 AND email = $2',
  [userId, email]
);
```

```python
# Python - use %s placeholders
cursor.execute(
    'SELECT * FROM "user" WHERE id = %s AND email = %s',
    (user_id, email)
)
```

### JSONB Operations

```sql
-- Access JSONB field
SELECT metadata->>'title' FROM chatkit_thread;

-- Query JSONB field
SELECT * FROM chatkit_thread WHERE metadata->>'title' ILIKE '%search%';

-- Update JSONB field
UPDATE chatkit_thread 
SET metadata = metadata || '{"key": "value"}'
WHERE id = $1;

-- Delete JSONB key
UPDATE chatkit_thread 
SET metadata = metadata - 'key'
WHERE id = $1;
```

### Pagination

```sql
-- Cursor-based pagination
SELECT * FROM chatkit_thread
WHERE "userId" = $1
  AND id > $2  -- cursor (after)
ORDER BY "createdAt" DESC
LIMIT $3;
```

---

## Error Codes

### PostgreSQL Error Codes

| Code | Name | Description |
|------|------|-------------|
| `23505` | unique_violation | Duplicate key |
| `23503` | foreign_key_violation | FK constraint failed |
| `42P01` | undefined_table | Table doesn't exist |
| `42703` | undefined_column | Column doesn't exist |
| `08P01` | protocol_violation | Protocol error |
| `28P01` | invalid_password | Authentication failed |
| `08006` | connection_failure | Connection lost |

### Error Handling

```typescript
// TypeScript
try {
  await pool.query('...');
} catch (error) {
  if (error.code === '23505') {
    // Handle duplicate key
  }
}
```

```python
# Python
try:
    cursor.execute('...')
except psycopg2.errors.UniqueViolation:
    # Handle duplicate key
except psycopg2.errors.ForeignKeyViolation:
    # Handle FK error
```
