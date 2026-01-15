# ChatKit Store Patterns

## Overview
ChatKit requires a Store implementation to persist threads and messages. This document covers both in-memory (development) and PostgreSQL (production) implementations.

## Required Abstract Methods (All 14!)

Every Store subclass MUST implement ALL of these methods:

```python
# ID Generation
1. generate_thread_id(context) -> str
2. generate_item_id(item_type, thread, context) -> str

# Thread Operations
3. load_thread(thread_id, context) -> ThreadMetadata
4. save_thread(thread, context) -> None
5. load_threads(limit, after, order, context) -> Page[ThreadMetadata]
6. delete_thread(thread_id, context) -> None

# Item Operations
7. load_thread_items(thread_id, after, limit, order, context) -> Page[ThreadItem]
8. add_thread_item(thread_id, item, context) -> None
9. save_item(thread_id, item, context) -> None
10. load_item(thread_id, item_id, context) -> ThreadItem
11. delete_thread_item(thread_id, item_id, context) -> None

# Attachment Operations (Often forgotten!)
12. save_attachment(attachment, context) -> None
13. load_attachment(attachment_id, context) -> Any
14. delete_attachment(attachment_id, context) -> None
```

## Correct Imports
```python
# CORRECT
from chatkit.store import Store           # SINGULAR
from chatkit.types import ThreadMetadata, ThreadItem, Page
from chatkit.types import AssistantMessageItem, UserMessageItem

# WRONG - these don't exist!
# from chatkit.stores import Store        # WRONG (plural)
# from chatkit.models import ...          # WRONG
```

---

## MemoryStore (Development)

For development and testing only - data is lost on restart.

```python
import uuid
from datetime import datetime, timezone
from typing import Any
from dataclasses import dataclass, field

from chatkit.store import Store
from chatkit.types import ThreadMetadata, ThreadItem, Page


@dataclass
class ThreadState:
    thread: ThreadMetadata
    items: list[ThreadItem] = field(default_factory=list)


class MemoryStore(Store[dict]):
    """In-memory store for development"""

    def __init__(self) -> None:
        self._threads: dict[str, ThreadState] = {}
        self._attachments: dict[str, Any] = {}

    # ==================== ID Generation ====================

    def generate_thread_id(self, context: dict) -> str:
        return f"thread_{uuid.uuid4().hex[:12]}"

    def generate_item_id(self, item_type: str, thread: ThreadMetadata, context: dict) -> str:
        return f"{item_type}_{uuid.uuid4().hex[:12]}"

    # ==================== Thread Operations ====================

    async def load_thread(self, thread_id: str, context: dict) -> ThreadMetadata:
        state = self._threads.get(thread_id)
        if state:
            return state.thread.model_copy(deep=True)

        # Create new thread
        thread = ThreadMetadata(
            id=thread_id,
            created_at=datetime.now(timezone.utc),
            metadata={}
        )
        self._threads[thread_id] = ThreadState(thread=thread.model_copy(deep=True), items=[])
        return thread

    async def save_thread(self, thread: ThreadMetadata, context: dict) -> None:
        state = self._threads.get(thread.id)
        if state:
            state.thread = thread.model_copy(deep=True)
        else:
            self._threads[thread.id] = ThreadState(thread=thread.model_copy(deep=True), items=[])

    async def load_threads(self, limit: int, after: str | None, order: str, context: dict) -> Page[ThreadMetadata]:
        threads = [s.thread.model_copy(deep=True) for s in self._threads.values()]
        threads.sort(key=lambda t: t.created_at, reverse=(order == "desc"))
        return Page(data=threads[:limit], has_more=len(threads) > limit)

    async def delete_thread(self, thread_id: str, context: dict) -> None:
        self._threads.pop(thread_id, None)

    # ==================== Item Operations ====================

    async def load_thread_items(self, thread_id: str, after: str | None, limit: int, order: str, context: dict) -> Page[ThreadItem]:
        state = self._threads.get(thread_id)
        if not state:
            return Page(data=[], has_more=False)

        items = [item.model_copy(deep=True) for item in state.items]
        items.sort(key=lambda i: getattr(i, "created_at", datetime.now(timezone.utc)), reverse=(order == "desc"))

        start = 0
        if after:
            for idx, item in enumerate(items):
                if item.id == after:
                    start = idx + 1
                    break

        result = items[start:start + limit]
        has_more = len(items) > start + limit
        return Page(data=result, has_more=has_more)

    async def add_thread_item(self, thread_id: str, item: ThreadItem, context: dict) -> None:
        state = self._threads.get(thread_id)
        if not state:
            await self.load_thread(thread_id, context)
            state = self._threads[thread_id]

        # Update if exists
        for i, existing in enumerate(state.items):
            if existing.id == item.id:
                state.items[i] = item.model_copy(deep=True)
                return

        state.items.append(item.model_copy(deep=True))

    async def save_item(self, thread_id: str, item: ThreadItem, context: dict) -> None:
        await self.add_thread_item(thread_id, item, context)

    async def load_item(self, thread_id: str, item_id: str, context: dict) -> ThreadItem:
        state = self._threads.get(thread_id)
        if state:
            for item in state.items:
                if item.id == item_id:
                    return item.model_copy(deep=True)
        raise ValueError(f"Item {item_id} not found")

    async def delete_thread_item(self, thread_id: str, item_id: str, context: dict) -> None:
        state = self._threads.get(thread_id)
        if state:
            state.items = [i for i in state.items if i.id != item_id]

    # ==================== Attachment Operations ====================

    async def save_attachment(self, attachment: Any, context: dict) -> None:
        self._attachments[attachment.id] = attachment

    async def load_attachment(self, attachment_id: str, context: dict) -> Any:
        if attachment_id not in self._attachments:
            raise ValueError(f"Attachment {attachment_id} not found")
        return self._attachments[attachment_id]

    async def delete_attachment(self, attachment_id: str, context: dict) -> None:
        self._attachments.pop(attachment_id, None)
```

---

## PostgreSQL Store (Production)

For production with user isolation and persistence.

### Database Schema
```sql
-- Threads table
CREATE TABLE chatkit_thread (
    id VARCHAR(255) PRIMARY KEY,
    "userId" VARCHAR(255) NOT NULL,
    metadata JSONB DEFAULT '{}',
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Thread items table
CREATE TABLE chatkit_thread_item (
    id VARCHAR(255) PRIMARY KEY,
    "threadId" VARCHAR(255) REFERENCES chatkit_thread(id) ON DELETE CASCADE,
    type VARCHAR(50),
    content JSONB,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Attachments table
CREATE TABLE chatkit_attachment (
    id VARCHAR(255) PRIMARY KEY,
    "threadId" VARCHAR(255),
    content JSONB,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_thread_user ON chatkit_thread("userId");
CREATE INDEX idx_thread_updated ON chatkit_thread("updatedAt");
CREATE INDEX idx_item_thread ON chatkit_thread_item("threadId");
```

### NeonStore Implementation
```python
import uuid
import json
from datetime import datetime, timezone
from typing import Any
from contextlib import contextmanager

import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import os

from chatkit.store import Store
from chatkit.types import ThreadMetadata, ThreadItem, Page
from chatkit.types import AssistantMessageItem, UserMessageItem

load_dotenv()


class NeonStore(Store[dict]):
    """PostgreSQL store with user isolation"""

    def __init__(self, connection_string: str = None):
        self.connection_string = connection_string or os.getenv('DATABASE_URL')
        if not self.connection_string:
            raise ValueError("DATABASE_URL required")

    @contextmanager
    def get_connection(self):
        conn = psycopg2.connect(dsn=self.connection_string, sslmode='require')
        try:
            yield conn
        finally:
            conn.close()

    def _get_user_id_from_context(self, context: dict) -> str:
        """Extract user ID for data isolation"""
        user = context.get('user', {})
        user_id = user.get('id') if isinstance(user, dict) else getattr(user, 'id', None)
        if not user_id:
            raise ValueError("User ID required for data isolation")
        return user_id

    # ==================== ID Generation ====================

    def generate_thread_id(self, context: dict) -> str:
        return f"thread_{uuid.uuid4().hex[:12]}"

    def generate_item_id(self, item_type: str, thread: ThreadMetadata, context: dict) -> str:
        return f"{item_type}_{uuid.uuid4().hex[:12]}"

    # ==================== Thread Operations ====================

    async def load_thread(self, thread_id: str, context: dict) -> ThreadMetadata:
        user_id = self._get_user_id_from_context(context)

        with self.get_connection() as conn:
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute("""
                SELECT id, metadata, "createdAt"
                FROM chatkit_thread
                WHERE id = %s AND "userId" = %s
            """, (thread_id, user_id))

            row = cursor.fetchone()
            if row:
                metadata = json.loads(row['metadata']) if isinstance(row['metadata'], str) else row['metadata']
                return ThreadMetadata(id=row['id'], metadata=metadata or {}, created_at=row['createdAt'])

            # Create new thread
            now = datetime.now(timezone.utc)
            cursor.execute("""
                INSERT INTO chatkit_thread (id, "userId", metadata, "createdAt", "updatedAt")
                VALUES (%s, %s, %s, %s, %s)
            """, (thread_id, user_id, json.dumps({}), now, now))
            conn.commit()

            return ThreadMetadata(id=thread_id, created_at=now, metadata={})

    async def save_thread(self, thread: ThreadMetadata, context: dict) -> None:
        user_id = self._get_user_id_from_context(context)

        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE chatkit_thread
                SET metadata = %s, "updatedAt" = %s
                WHERE id = %s AND "userId" = %s
            """, (json.dumps(thread.metadata), datetime.now(timezone.utc), thread.id, user_id))
            conn.commit()

    async def load_threads(self, limit: int, after: str | None, order: str, context: dict) -> Page[ThreadMetadata]:
        user_id = self._get_user_id_from_context(context)

        with self.get_connection() as conn:
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            order_dir = "DESC" if order == "desc" else "ASC"
            cursor.execute(f"""
                SELECT id, metadata, "createdAt"
                FROM chatkit_thread
                WHERE "userId" = %s
                ORDER BY "updatedAt" {order_dir}
                LIMIT %s
            """, (user_id, limit + 1))

            rows = cursor.fetchall()
            has_more = len(rows) > limit
            threads = []
            for row in rows[:limit]:
                metadata = json.loads(row['metadata']) if isinstance(row['metadata'], str) else row['metadata']
                threads.append(ThreadMetadata(id=row['id'], metadata=metadata or {}, created_at=row['createdAt']))

            return Page(data=threads, has_more=has_more)

    async def delete_thread(self, thread_id: str, context: dict) -> None:
        user_id = self._get_user_id_from_context(context)

        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                DELETE FROM chatkit_thread WHERE id = %s AND "userId" = %s
            """, (thread_id, user_id))
            conn.commit()

    # ==================== Item Operations ====================

    async def load_thread_items(self, thread_id: str, after: str | None, limit: int, order: str, context: dict) -> Page[ThreadItem]:
        user_id = self._get_user_id_from_context(context)

        with self.get_connection() as conn:
            cursor = conn.cursor(cursor_factory=RealDictCursor)

            # Verify thread belongs to user
            cursor.execute("""
                SELECT id FROM chatkit_thread WHERE id = %s AND "userId" = %s
            """, (thread_id, user_id))
            if not cursor.fetchone():
                return Page(data=[], has_more=False)

            order_dir = "DESC" if order == "desc" else "ASC"
            cursor.execute(f"""
                SELECT id, type, content, "createdAt"
                FROM chatkit_thread_item
                WHERE "threadId" = %s
                ORDER BY "createdAt" {order_dir}
                LIMIT %s
            """, (thread_id, limit + 1))

            rows = cursor.fetchall()
            has_more = len(rows) > limit
            items = []

            for row in rows[:limit]:
                content = json.loads(row['content']) if isinstance(row['content'], str) else row['content']
                stored_type = (row['type'] or '').lower()

                if stored_type in ['assistantmessageitem', 'assistant', 'message']:
                    if isinstance(content, dict) and 'thread_id' in content:
                        items.append(AssistantMessageItem.model_validate(content))
                    else:
                        items.append(AssistantMessageItem(
                            id=row['id'],
                            thread_id=thread_id,
                            created_at=row['createdAt'],
                            content=content.get('content', content) if isinstance(content, dict) else content
                        ))
                elif stored_type in ['usermessageitem', 'user']:
                    if isinstance(content, dict) and 'thread_id' in content:
                        items.append(UserMessageItem.model_validate(content))
                    else:
                        items.append(UserMessageItem(
                            id=row['id'],
                            thread_id=thread_id,
                            created_at=row['createdAt'],
                            content=content.get('content', []) if isinstance(content, dict) else [],
                            inference_options={}
                        ))

            return Page(data=items, has_more=has_more)

    async def add_thread_item(self, thread_id: str, item: ThreadItem, context: dict) -> None:
        user_id = self._get_user_id_from_context(context)

        with self.get_connection() as conn:
            cursor = conn.cursor()

            # Serialize item using model_dump
            if hasattr(item, 'model_dump'):
                item_data = item.model_dump()
                if 'created_at' in item_data and hasattr(item_data['created_at'], 'isoformat'):
                    item_data['created_at'] = item_data['created_at'].isoformat()
            else:
                item_data = {'id': item.id, 'content': getattr(item, 'content', {})}

            cursor.execute("""
                INSERT INTO chatkit_thread_item (id, "threadId", type, content, "createdAt")
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET
                    type = EXCLUDED.type,
                    content = EXCLUDED.content
            """, (
                item.id,
                thread_id,
                type(item).__name__.lower(),
                json.dumps(item_data, default=str),
                getattr(item, 'created_at', datetime.now(timezone.utc))
            ))
            conn.commit()

    async def save_item(self, thread_id: str, item: ThreadItem, context: dict) -> None:
        await self.add_thread_item(thread_id, item, context)

    async def load_item(self, thread_id: str, item_id: str, context: dict) -> ThreadItem:
        # Similar to load_thread_items but for single item
        page = await self.load_thread_items(thread_id, None, 100, "asc", context)
        for item in page.data:
            if item.id == item_id:
                return item
        raise ValueError(f"Item {item_id} not found")

    async def delete_thread_item(self, thread_id: str, item_id: str, context: dict) -> None:
        user_id = self._get_user_id_from_context(context)

        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                DELETE FROM chatkit_thread_item
                WHERE id = %s AND "threadId" IN (
                    SELECT id FROM chatkit_thread WHERE id = %s AND "userId" = %s
                )
            """, (item_id, thread_id, user_id))
            conn.commit()

    # ==================== Attachment Operations ====================

    async def save_attachment(self, attachment: Any, context: dict) -> None:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO chatkit_attachment (id, "threadId", content, "createdAt")
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content
            """, (
                attachment.id,
                getattr(attachment, 'threadId', None),
                json.dumps({'data': getattr(attachment, 'data', {})}),
                datetime.now(timezone.utc)
            ))
            conn.commit()

    async def load_attachment(self, attachment_id: str, context: dict) -> Any:
        with self.get_connection() as conn:
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute("""
                SELECT id, content FROM chatkit_attachment WHERE id = %s
            """, (attachment_id,))
            row = cursor.fetchone()
            if not row:
                raise ValueError(f"Attachment {attachment_id} not found")
            
            content = json.loads(row['content']) if isinstance(row['content'], str) else row['content']
            attachment = type('Attachment', (), {})()
            attachment.id = row['id']
            attachment.data = content.get('data', {})
            return attachment

    async def delete_attachment(self, attachment_id: str, context: dict) -> None:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM chatkit_attachment WHERE id = %s", (attachment_id,))
            conn.commit()
```

## User Isolation Pattern

The key to multi-user support is extracting user ID from context:

```python
def _get_user_id_from_context(self, context: dict) -> str:
    user = context.get('user', {})
    user_id = user.get('id') if isinstance(user, dict) else getattr(user, 'id', None)
    if not user_id:
        raise ValueError("User ID required for data isolation")
    return user_id
```

Always pass user context from your endpoint:
```python
@app.post("/api/chatkit")
async def chatkit_endpoint(request: Request):
    user_id = get_authenticated_user_id(request)
    context = {"user": {"id": user_id}}
    result = await server.process(await request.body(), context)
```
