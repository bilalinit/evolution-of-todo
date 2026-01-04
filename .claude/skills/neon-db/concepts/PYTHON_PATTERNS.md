# Python Patterns for Neon PostgreSQL

## Connection with Context Manager

The recommended pattern for connecting to Neon PostgreSQL from Python:

```python
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
from dotenv import load_dotenv
import os

load_dotenv()

class NeonStore:
    """PostgreSQL-based store using Neon database"""

    def __init__(self, connection_string: str | None = None) -> None:
        self.connection_string = connection_string or os.getenv('DATABASE_URL')
        if not self.connection_string:
            raise ValueError("DATABASE_URL environment variable is required")

    @contextmanager
    def get_connection(self):
        """Context manager for database connections"""
        conn = None
        try:
            conn = psycopg2.connect(
                dsn=self.connection_string,
                sslmode='require'  # Required for Neon
            )
            yield conn
        except psycopg2.OperationalError as e:
            raise ValueError(f"Database connection failed: {str(e)}")
        except Exception as e:
            if conn:
                conn.rollback()
            raise e
        finally:
            if conn:
                conn.close()
```

---

## Query Patterns

### Select with RealDictCursor

```python
with self.get_connection() as conn:
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    cursor.execute("""
        SELECT id, name, email, "createdAt"
        FROM "user"
        WHERE id = %s
    """, (user_id,))
    
    row = cursor.fetchone()
    # row is a dict: {'id': '...', 'name': '...', 'email': '...'}
```

### Insert with JSONB

```python
import json

with self.get_connection() as conn:
    cursor = conn.cursor()
    
    metadata = {"title": "Chat Session", "tags": ["ai", "help"]}
    
    cursor.execute("""
        INSERT INTO chatkit_thread (id, "userId", metadata, "createdAt", "updatedAt")
        VALUES (%s, %s, %s, %s, %s)
    """, (
        thread_id,
        user_id,
        json.dumps(metadata),
        datetime.now(timezone.utc),
        datetime.now(timezone.utc)
    ))
    
    conn.commit()
```

### Upsert Pattern (ON CONFLICT)

```python
cursor.execute("""
    INSERT INTO chatkit_thread (id, "userId", metadata, "createdAt", "updatedAt")
    VALUES (%s, %s, %s, %s, %s)
    ON CONFLICT (id) DO UPDATE SET
        metadata = EXCLUDED.metadata,
        "updatedAt" = EXCLUDED."updatedAt"
""", (thread_id, user_id, json.dumps(metadata), now, now))
```

---

## User Isolation Pattern

Extract user ID from context for multi-tenant data isolation:

```python
def _get_user_id_from_context(self, context: dict) -> str:
    """Extract user ID from context for data isolation"""
    user = context.get('user', {})
    user_id = user.get('id') if isinstance(user, dict) else getattr(user, 'id', None)

    if not user_id:
        raise ValueError(
            "User ID is required for data isolation. "
            "Please ensure authentication context is provided."
        )

    return user_id
```

Usage in queries:

```python
async def load_threads(self, limit: int, after: str | None, order: str, context: dict):
    user_id = self._get_user_id_from_context(context)
    
    with self.get_connection() as conn:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # All queries filter by userId for isolation
        cursor.execute("""
            SELECT id, metadata, "createdAt", "updatedAt"
            FROM chatkit_thread
            WHERE "userId" = %s
            ORDER BY "updatedAt" DESC
            LIMIT %s
        """, (user_id, limit))
```

---

## ChatKit Store Integration

When implementing ChatKit's Store interface, implement all required methods:

```python
from chatkit.store import Store
from chatkit.types import ThreadMetadata, ThreadItem, Page
from chatkit.types import AssistantMessageItem, UserMessageItem

class NeonStore(Store[dict]):
    """PostgreSQL-based store for ChatKit"""
    
    def generate_thread_id(self, context: dict) -> str:
        return f"thread_{uuid.uuid4().hex[:12]}"

    def generate_item_id(self, item_type: str, thread: ThreadMetadata, context: dict) -> str:
        return f"{item_type}_{uuid.uuid4().hex[:12]}"

    async def load_thread(self, thread_id: str, context: dict) -> ThreadMetadata:
        # Implementation...
        pass

    async def save_thread(self, thread: ThreadMetadata, context: dict) -> None:
        # Implementation...
        pass

    # ... implement all 14 required methods
```

---

## Error Handling

```python
try:
    with self.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM nonexistent_table")
except psycopg2.errors.UndefinedTable as e:
    print("Table does not exist - run migrations")
except psycopg2.errors.UniqueViolation as e:
    print("Duplicate key constraint violated")
except psycopg2.OperationalError as e:
    print(f"Connection error: {e}")
```

---

## Common psycopg2 Imports

```python
import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2 import sql  # For dynamic SQL
from psycopg2.pool import SimpleConnectionPool  # For connection pooling
from contextlib import contextmanager
```
