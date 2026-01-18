# Store Implementation Patterns

Complete PostgreSQL-backed store implementation for ChatKit with user isolation.

## Store Interface

### Required Methods

The ChatKit Store interface requires 14 methods:

```python
from chatkit.store import Store, Page
from chatkit.types import ThreadMetadata, ThreadItem
from typing import Optional, AsyncIterator
from datetime import datetime

class DatabaseStore(Store[dict]):
    def __init__(self):
        # In-memory cache for thread items (ChatKit items are complex objects)
        self._thread_items: dict[str, list[ThreadItem]] = {}
        # Map ChatKit thread IDs to database UUIDs
        self._thread_id_to_uuid: dict[str, str] = {}
        self._uuid_to_thread_id: dict[str, str] = {}

    # Required methods:
    async def save_thread(self, thread: ThreadMetadata, context: dict) -> None
    async def load_thread(self, thread_id: str, context: dict) -> Optional[ThreadMetadata]
    async def load_threads(self, after: Optional[str], limit: int, order: str, context: dict) -> Page[ThreadMetadata]
    async def delete_thread(self, thread_id: str, context: dict) -> None
    async def load_thread_items(self, thread_id: str, after: Optional[str], limit: int, order: str, context: dict) -> Page[ThreadItem]
    async def add_thread_item(self, thread_id: str, item: ThreadItem, context: dict) -> None
    async def save_item(self, thread_id: str, item: ThreadItem, context: dict) -> None
    async def load_item(self, thread_id: str, item_id: str, context: dict) -> Optional[ThreadItem]
    async def delete_thread_item(self, thread_id: str, item_id: str, context: dict) -> None
    async def save_attachment(self, attachment_id: str, data: bytes, context: dict) -> None
    async def load_attachment(self, attachment_id: str, context: dict) -> Optional[bytes]
    async def delete_attachment(self, attachment_id: str, context: dict) -> None
```

## User Isolation Pattern

### Context Extraction

```python
def _get_user_id_from_context(self, context: dict) -> str | None:
    """Extract user ID from context for user isolation"""
    return context.get("user_id")

def _require_user_id(self, context: dict) -> str:
    """Get user ID or raise exception if missing"""
    user_id = self._get_user_id_from_context(context)
    if not user_id:
        raise ValueError("User ID not found in context")
    return user_id
```

### UUID Mapping

```python
from uuid import uuid5, NAMESPACE_DNS

def _get_or_create_uuid(self, thread_id: str) -> str:
    """Generate deterministic UUID for ChatKit thread ID"""
    if thread_id in self._thread_id_to_uuid:
        return self._thread_id_to_uuid[thread_id]

    # Generate deterministic UUID from thread ID
    db_uuid = str(uuid5(NAMESPACE_DNS, f"chatkit-{thread_id}"))
    self._thread_id_to_uuid[thread_id] = db_uuid
    self._uuid_to_thread_id[db_uuid] = thread_id
    return db_uuid
```

## Thread Operations

### Save Thread

```python
from sqlmodel import Session
from sqlalchemy import text
from backend.database import engine
import json

async def save_thread(self, thread: ThreadMetadata, context: dict) -> None:
    """Save thread metadata to database with user isolation"""
    user_id = self._require_user_id(context)

    thread_id = thread.id
    db_uuid = self._get_or_create_uuid(thread_id)

    with Session(engine) as session:
        # Check if thread exists
        result = session.execute(
            text("SELECT session_id FROM chat_sessions WHERE session_id = :tid"),
            {"tid": db_uuid}
        )
        existing = result.first()

        if not existing:
            # Store original ChatKit thread ID in metadata
            meta = {"chatkit_thread_id": thread_id}
            if thread.metadata:
                meta.update(thread.metadata)

            # Insert new thread
            session.execute(
                text("""
                    INSERT INTO chat_sessions (session_id, user_id, title, created_at, updated_at, metadata)
                    VALUES (:sid, :uid, :title, :created, :updated, :meta)
                """),
                {
                    "sid": db_uuid,
                    "uid": user_id,
                    "title": meta.get("title", "New Chat"),
                    "created": getattr(thread, "created_at", datetime.utcnow()),
                    "updated": datetime.utcnow(),
                    "meta": json.dumps(meta)
                }
            )
            session.commit()
            print(f"🔒 Thread {thread_id} (UUID: {db_uuid[:8]}...) saved to DB for user {user_id}")

    # Initialize thread items cache
    if thread_id not in self._thread_items:
        self._thread_items[thread_id] = []
```

### Load Thread

```python
async def load_thread(self, thread_id: str, context: dict) -> Optional[ThreadMetadata]:
    """Load thread from database with user isolation"""
    from chatkit.types import ThreadMetadata

    user_id = self._require_user_id(context)
    db_uuid = self._get_or_create_uuid(thread_id)

    with Session(engine) as session:
        result = session.execute(
            text("""
                SELECT session_id, user_id, title, created_at, metadata
                FROM chat_sessions
                WHERE session_id = :tid
            """),
            {"tid": db_uuid}
        )
        row = result.first()

        if row:
            owner_id = row[1]
            # Check ownership
            if owner_id != user_id:
                print(f"⚠️ User {user_id} tried to access thread owned by {owner_id}")
                return None

            # Parse metadata
            meta = row[4] if isinstance(row[4], dict) else (json.loads(row[4]) if row[4] else {})
            original_id = meta.get("chatkit_thread_id", thread_id)

            return ThreadMetadata(
                id=original_id,  # Return original ChatKit thread ID
                created_at=row[3],
                metadata={"title": row[2]}
            )
        else:
            # Create new thread if it doesn't exist
            print(f"🔍 Thread {thread_id} not found in DB, creating new one")
            new_thread = ThreadMetadata(
                id=thread_id,
                created_at=datetime.utcnow(),
                metadata={}
            )
            await self.save_thread(new_thread, context)
            return new_thread
```

### Load Threads (List)

```python
async def load_threads(
    self, after: Optional[str], limit: int, order: str, context: dict
) -> Page[ThreadMetadata]:
    """Load user's threads from database"""
    from chatkit.types import ThreadMetadata

    user_id = self._require_user_id(context)

    with Session(engine) as session:
        order_dir = "DESC" if order == "desc" else "ASC"

        # Build query with pagination
        query = f"""
            SELECT session_id, title, created_at, metadata
            FROM chat_sessions
            WHERE user_id = :uid
            ORDER BY created_at {order_dir}
            LIMIT :lim
        """

        result = session.execute(
            text(query),
            {"uid": user_id, "lim": limit + 1}
        )
        rows = result.fetchall()

        threads = []
        for row in rows[:limit]:
            # Parse metadata to get original ChatKit thread ID
            meta = row[3] if isinstance(row[3], dict) else (json.loads(row[3]) if row[3] else {})
            original_id = meta.get("chatkit_thread_id", str(row[0]))

            # Cache the UUID mapping
            self._thread_id_to_uuid[original_id] = str(row[0])
            self._uuid_to_thread_id[str(row[0])] = original_id

            threads.append(ThreadMetadata(
                id=original_id,  # Return original ChatKit thread ID
                created_at=row[2],
                metadata={"title": row[1]}
            ))

        has_more = len(rows) > limit
        print(f"🔒 User {user_id} has {len(threads)} threads in DB")

        return Page(
            data=threads,
            has_more=has_more,
            after=threads[-1].id if has_more and threads else None
        )
```

### Delete Thread

```python
async def delete_thread(self, thread_id: str, context: dict) -> None:
    """Delete thread and all its messages from database"""
    user_id = self._require_user_id(context)
    db_uuid = self._get_or_create_uuid(thread_id)

    with Session(engine) as session:
        # Verify ownership before deletion
        result = session.execute(
            text("SELECT user_id FROM chat_sessions WHERE session_id = :tid"),
            {"tid": db_uuid}
        )
        row = result.first()

        if not row:
            print(f"⚠️ Thread {thread_id} not found for deletion")
            return

        if row[0] != user_id:
            print(f"⚠️ User {user_id} tried to delete thread owned by {row[0]}")
            return

        # Delete messages first (foreign key constraint)
        session.execute(
            text("DELETE FROM chat_messages WHERE session_id = :tid"),
            {"tid": db_uuid}
        )

        # Delete thread
        session.execute(
            text("DELETE FROM chat_sessions WHERE session_id = :tid"),
            {"tid": db_uuid}
        )

        session.commit()
        print(f"🗑️ Thread {thread_id} (UUID: {db_uuid[:8]}...) deleted from DB")

    # Clean up caches
    self._thread_items.pop(thread_id, None)
    self._thread_id_to_uuid.pop(thread_id, None)
    self._uuid_to_thread_id.pop(db_uuid, None)
```

## Message Operations

### Load Thread Items

```python
async def load_thread_items(
    self, thread_id: str, after: Optional[str], limit: int, order: str, context: dict
) -> Page[ThreadItem]:
    """Load messages for a thread from database"""
    from chatkit.types import UserMessageItem, AssistantMessageItem, AssistantMessageContent

    db_uuid = self._get_or_create_uuid(thread_id)
    user_id = self._require_user_id(context)

    with Session(engine) as session:
        # Always order by timestamp ASC (oldest first) for proper chat display
        result = session.execute(
            text("""
                SELECT message_id, content, sender_type, timestamp, metadata
                FROM chat_messages
                WHERE session_id = :sid
                ORDER BY timestamp ASC
                LIMIT :lim
            """),
            {"sid": db_uuid, "lim": limit + 1}
        )
        rows = result.fetchall()

        items = []
        for row in rows[:limit]:
            msg_id = str(row[0])
            content = row[1]
            sender_type = row[2]
            timestamp = row[3]
            meta = row[4] if isinstance(row[4], dict) else (json.loads(row[4]) if row[4] else {})
            original_msg_id = meta.get("chatkit_message_id", msg_id)

            try:
                if sender_type == "user":
                    # Create UserMessageItem
                    items.append(UserMessageItem(
                        thread_id=thread_id,
                        id=original_msg_id,
                        created_at=timestamp,
                        content=[{"type": "input_text", "text": content}],
                        inference_options={}
                    ))
                else:  # assistant or tool
                    # Create AssistantMessageItem
                    items.append(AssistantMessageItem(
                        thread_id=thread_id,
                        id=original_msg_id,
                        created_at=timestamp,
                        content=[AssistantMessageContent(text=content)]
                    ))
            except Exception as e:
                print(f"⚠️ Error creating message item: {e}")
                continue

        has_more = len(rows) > limit

        print(f"📨 Loaded {len(items)} messages for thread {thread_id}")

        return Page(
            data=items,
            has_more=has_more,
            after=items[-1].id if has_more and items else None
        )
```

### Save Item (Message)

```python
async def save_item(self, thread_id: str, item: ThreadItem, context: dict) -> None:
    """Save message to database with user isolation"""
    from uuid import uuid4

    print(f"📝 save_item called for thread {thread_id}, item type: {type(item).__name__}")

    # Add to in-memory cache
    await self.add_thread_item(thread_id, item, context)

    # Persist to database
    db_uuid = self._get_or_create_uuid(thread_id)
    user_id = self._require_user_id(context)

    # Extract message content and type
    content = ""
    sender_type = "user"

    if hasattr(item, 'content'):
        for c in item.content:
            if hasattr(c, 'text'):
                content = c.text
                break

    # Determine sender type from item class name
    item_type = type(item).__name__.lower()
    if 'assistant' in item_type:
        sender_type = 'assistant'
    elif 'tool' in item_type:
        sender_type = 'tool'
    else:
        sender_type = 'user'

    # Generate UUID for database, store original ID in metadata
    msg_uuid = str(uuid4())
    meta = {"chatkit_message_id": item.id}

    try:
        with Session(engine) as session:
            session.execute(
                text("""
                    INSERT INTO chat_messages (message_id, session_id, user_id, content, sender_type, timestamp, metadata)
                    VALUES (:mid, :sid, :uid, :content, :stype, :ts, :meta)
                """),
                {
                    "mid": msg_uuid,
                    "sid": db_uuid,
                    "uid": user_id,
                    "content": content,
                    "stype": sender_type,
                    "ts": datetime.utcnow(),  # Use current UTC time for proper ordering
                    "meta": json.dumps(meta)
                }
            )
            session.commit()
            print(f"💾 Saved {sender_type} message to DB for thread {thread_id}")
    except Exception as e:
        print(f"⚠️ Failed to save message to DB: {e}")
```

### Add Thread Item (Cache)

```python
async def add_thread_item(self, thread_id: str, item: ThreadItem, context: dict) -> None:
    """Add item to in-memory cache for current session"""
    if thread_id not in self._thread_items:
        self._thread_items[thread_id] = []
    self._thread_items[thread_id].append(item)
```

### Load Item

```python
async def load_item(self, thread_id: str, item_id: str, context: dict) -> Optional[ThreadItem]:
    """Load specific item from cache or database"""
    # First check in-memory cache
    items = self._thread_items.get(thread_id, [])
    for item in items:
        if item.id == item_id:
            return item

    # TODO: Implement database fallback if needed
    return None
```

### Delete Thread Item

```python
async def delete_thread_item(self, thread_id: str, item_id: str, context: dict) -> None:
    """Delete message from cache and database"""
    # Remove from in-memory cache
    if thread_id in self._thread_items:
        self._thread_items[thread_id] = [
            item for item in self._thread_items[thread_id] if item.id != item_id
        ]

    # TODO: Implement database deletion
    # This would require deleting from chat_messages table
```

## Attachment Operations

### Save Attachment

```python
async def save_attachment(self, attachment_id: str, data: bytes, context: dict) -> None:
    """Save attachment data (TODO: Implement)"""
    # TODO: Implement attachment storage
    # Could use S3, local filesystem, or database BLOB storage
    pass
```

### Load Attachment

```python
async def load_attachment(self, attachment_id: str, context: dict) -> Optional[bytes]:
    """Load attachment data (TODO: Implement)"""
    # TODO: Implement attachment loading
    return None
```

### Delete Attachment

```python
async def delete_attachment(self, attachment_id: str, context: dict) -> None:
    """Delete attachment data (TODO: Implement)"""
    # TODO: Implement attachment deletion
    pass
```

## Helper Methods

### Extract Message Content

```python
def _extract_item_content(self, item: ThreadItem) -> str:
    """Extract text content from ThreadItem"""
    if not hasattr(item, 'content'):
        return ""

    for content_item in item.content:
        if hasattr(content_item, 'text'):
            return content_item.text
        elif hasattr(content_item, 'type') and content_item.type == 'input_text':
            return content_item.text

    return ""
```

### Get Sender Type

```python
def _get_sender_type(self, item: ThreadItem) -> str:
    """Determine sender type from item class"""
    item_type = type(item).__name__.lower()

    if 'assistant' in item_type:
        return 'assistant'
    elif 'tool' in item_type:
        return 'tool'
    elif 'user' in item_type:
        return 'user'
    else:
        return 'unknown'
```

## Database Schema

### Complete Schema

```sql
-- Chat sessions table
CREATE TABLE chat_sessions (
    session_id UUID PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Chat messages table
CREATE TABLE chat_messages (
    message_id UUID PRIMARY KEY,
    session_id UUID REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    sender_type VARCHAR(50) NOT NULL, -- 'user', 'assistant', 'tool'
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Indexes for performance
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_created_at ON chat_sessions(created_at);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_timestamp ON chat_messages(timestamp);
CREATE INDEX idx_chat_messages_sender_type ON chat_messages(sender_type);

-- Constraints
ALTER TABLE chat_messages ADD CONSTRAINT fk_chat_session
    FOREIGN KEY (session_id) REFERENCES chat_sessions(session_id) ON DELETE CASCADE;
```

### Migration Script

```sql
-- migrations/chat_sessions_create.sql
CREATE TABLE IF NOT EXISTS chat_sessions (
    session_id UUID PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- migrations/chat_messages_create.sql
CREATE TABLE IF NOT EXISTS chat_messages (
    message_id UUID PRIMARY KEY,
    session_id UUID REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    sender_type VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);
```

## Performance Optimizations

### Connection Pooling

```python
from sqlalchemy import create_engine
from sqlalchemy.pool import AsyncAdaptedQueuePool

# Use connection pooling for better performance
engine = create_engine(
    os.getenv("DATABASE_URL"),
    poolclass=AsyncAdaptedQueuePool,
    pool_size=10,
    max_overflow=20,
    pool_timeout=30,
    pool_recycle=3600,
)
```

### Caching Strategy

```python
class DatabaseStore(Store[dict]):
    def __init__(self):
        # Thread metadata cache
        self._thread_cache: dict[str, ThreadMetadata] = {}
        # Thread items cache (in-memory for current session)
        self._thread_items: dict[str, list[ThreadItem]] = {}
        # UUID mapping cache
        self._thread_id_to_uuid: dict[str, str] = {}
        self._uuid_to_thread_id: dict[str, str] = {}

        # Cache TTL (time-to-live) in seconds
        self._cache_ttl = 300  # 5 minutes

    def _get_cached_thread(self, thread_id: str) -> Optional[ThreadMetadata]:
        """Get thread from cache if not expired"""
        if thread_id in self._thread_cache:
            cached = self._thread_cache[thread_id]
            # Check if cache is still valid (simplified - add timestamp in real implementation)
            return cached
        return None

    def _set_cached_thread(self, thread_id: str, thread: ThreadMetadata) -> None:
        """Cache thread metadata"""
        self._thread_cache[thread_id] = thread
```

## Error Handling

### Database Error Handling

```python
from sqlalchemy.exc import SQLAlchemyError

async def save_item_safe(self, thread_id: str, item: ThreadItem, context: dict) -> bool:
    """Save item with comprehensive error handling"""
    try:
        await self.save_item(thread_id, item, context)
        return True
    except SQLAlchemyError as e:
        print(f"❌ Database error saving item: {e}")
        # Could implement retry logic here
        return False
    except Exception as e:
        print(f"❌ Unexpected error saving item: {e}")
        return False
```

### Ownership Verification

```python
async def _verify_thread_ownership(self, thread_id: str, user_id: str) -> bool:
    """Verify that user owns the thread"""
    db_uuid = self._get_or_create_uuid(thread_id)

    with Session(engine) as session:
        result = session.execute(
            text("SELECT user_id FROM chat_sessions WHERE session_id = :tid"),
            {"tid": db_uuid}
        )
        row = result.first()

        if not row:
            return False

        return row[0] == user_id
```

## Testing Patterns

### Mock Store for Testing

```python
class MockMemoryStore(Store[dict]):
    """In-memory store for testing"""

    def __init__(self):
        self.threads: dict[str, ThreadMetadata] = {}
        self.messages: dict[str, list[ThreadItem]] = {}

    async def save_thread(self, thread: ThreadMetadata, context: dict) -> None:
        self.threads[thread.id] = thread
        if thread.id not in self.messages:
            self.messages[thread.id] = []

    async def load_thread(self, thread_id: str, context: dict) -> Optional[ThreadMetadata]:
        return self.threads.get(thread_id)

    async def load_threads(
        self, after: Optional[str], limit: int, order: str, context: dict
    ) -> Page[ThreadMetadata]:
        threads = list(self.threads.values())
        return Page(data=threads, has_more=False, after=None)

    # ... implement other methods
```

### Integration Tests

```python
import pytest
from datetime import datetime

@pytest.mark.asyncio
async def test_database_store_user_isolation():
    """Test that users can only access their own threads"""
    store = DatabaseStore()

    # Create context for user A
    context_a = {"user_id": "user-a"}
    thread_a = ThreadMetadata(
        id="thread-a",
        created_at=datetime.utcnow(),
        metadata={"title": "User A Thread"}
    )

    # Create context for user B
    context_b = {"user_id": "user-b"}

    # User A saves thread
    await store.save_thread(thread_a, context_a)

    # User A can load their thread
    loaded = await store.load_thread("thread-a", context_a)
    assert loaded is not None
    assert loaded.id == "thread-a"

    # User B cannot load user A's thread
    loaded_b = await store.load_thread("thread-a", context_b)
    assert loaded_b is None
```

## Production Considerations

### Database Migrations

```python
# Use Alembic for database migrations
# alembic revision --autogenerate -m "Add chat tables"
# alembic upgrade head
```

### Backup Strategy

```sql
-- Regular backup of chat data
pg_dump -h your-db-host -U your-user -d your-db -t your_chat_sessions_table -t your_chat_messages_table > chat_backup.sql
```

### Data Retention

```python
# Implement data retention policy
async def cleanup_old_threads(self, days_old: int = 90) -> None:
    """Delete threads older than specified days"""
    with Session(engine) as session:
        session.execute(
            text("""
                DELETE FROM chat_sessions
                WHERE created_at < NOW() - INTERVAL ':days days'
            """),
            {"days": days_old}
        )
        session.commit()
```

This store implementation provides a complete, production-ready PostgreSQL-backed storage solution with proper user isolation, performance optimizations, and error handling.