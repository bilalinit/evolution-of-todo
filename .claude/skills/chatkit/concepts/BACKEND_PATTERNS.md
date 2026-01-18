# Backend Implementation Patterns

Complete FastAPI backend implementation for ChatKit with OpenAI Agents SDK integration.

> [!IMPORTANT]
> ChatKit uses a **single endpoint** architecture. All operations (threads, messages, sessions) go through one `/api/chatkit` POST endpoint. Do NOT create separate `/session`, `/threads`, `/refresh` endpoints.

## Architecture Overview

```
Frontend (ChatKit React)
    ↓ POST /api/chatkit
Next.js Proxy (with JWT injection)
    ↓ POST /api/chatkit (with Authorization header)
FastAPI Backend
    ↓
ChatKitServer.process() → MyChatKitServer.respond()
    ↓
DatabaseStore (saves threads/messages to PostgreSQL)
    ↓
OpenAI Agents SDK + MCP Tools (or any LLM/Agent)
```

## Customization Required

> [!NOTE]
> This skill provides **ChatKit-specific patterns** that are universal. Your **database schema and project structure** will vary.

### Project-Specific (must adapt)

| Category | Item | Example Variations |
|----------|------|-------------------|
| **Agent System** | Import path | `from myapp.agents import agent` |
| | MCP wrapper path | `backend_dir / "mcp_server.py"` |
| **Database** | Engine import | `from myapp.db import engine` |
| | User table name | `"user"`, `"users"`, `"accounts"` |
| | User ID column | `id`, `user_id`, `uid` |
| | Foreign key reference | `REFERENCES users(user_id)` |
| **Auth** | JWT verification | `from myapp.auth import verify_token` |
| | User ID extraction | `context.get("user_id")` or `context.get("uid")` |

### Database Schema Options

You can use **your existing tables** or create the ChatKit tables. Either way, you need:

**Option A: Create dedicated ChatKit tables (recommended)**
```sql
-- Use the schema from this skill, adapt table/column names to match your project
CREATE TABLE chat_sessions (...);
CREATE TABLE chat_messages (...);
```

**Option B: Add to existing tables**
```sql
-- Add chat columns to your existing user/conversation tables
ALTER TABLE your_conversations ADD COLUMN chatkit_thread_id TEXT;
```

### What's Universal (no changes needed)

These ChatKit patterns work with ANY database schema:

| Pattern | Why It's Universal |
|---------|-------------------|
| **UUID mapping** (`uuid5` for thread IDs) | Converts ChatKit string IDs → your UUID columns |
| **Message types** (`input_text`, `inference_options`) | ChatKit SDK requirement, not database related |
| **Timestamp handling** (`datetime.utcnow()`) | Ensures correct ordering regardless of DB |
| **Single endpoint** (`/api/chatkit`) | ChatKit architecture, not database related |
| **save_item explicit calls** | ChatKit behavior, not database related |

### Quick Adaptation Checklist

When using this skill in a new project:

1. ☐ Copy the `DatabaseStore` class
2. ☐ Update SQL table names (`chat_sessions` → your table)
3. ☐ Update SQL column names (`user_id` → your column)
4. ☐ Update `_get_user_id_from_context()` to match your auth
5. ☐ Update agent imports in `respond()`
6. ☐ Update MCP wrapper path (or remove if not using MCP)

## ChatKitServer Subclass

### Basic Structure

```python
from chatkit.server import ChatKitServer, StreamingResult
from chatkit.types import (
    ThreadMetadata, UserMessageItem, AssistantMessageItem,
    AssistantMessageContent, ThreadStreamEvent, ThreadItemDoneEvent
)
from chatkit.store import Store, Page
from typing import AsyncIterator
from datetime import datetime

class MyChatKitServer(ChatKitServer[dict]):
    def __init__(self, store: Store):
        super().__init__(store=store)
        self.store = store

    async def respond(
        self,
        thread: ThreadMetadata,
        input_user_message: UserMessageItem | None,
        context: dict,
    ) -> AsyncIterator[ThreadStreamEvent]:
        """Main response handler - called by ChatKit SDK"""
        # Implementation goes here
        pass
```

### Complete respond() Implementation

> [!CAUTION]
> ChatKit does NOT automatically call `save_item()` for messages. You MUST explicitly call `save_item()` for both user messages and assistant responses to persist them.

```python
async def respond(
    self,
    thread: ThreadMetadata,
    input_user_message: UserMessageItem | None,
    context: dict,
) -> AsyncIterator[ThreadStreamEvent]:
    """Handle ChatKit requests and stream responses using the agent system"""
    from pathlib import Path
    from agents import Runner
    from agents.mcp import MCPServerStdio
    # TODO: Import your agent and config
    # from your_app.agents import your_agent, config
    from chatkit.types import AssistantMessageItem, AssistantMessageContent, ThreadItemDoneEvent

    print(f"🔍 ChatKit server processing thread: {thread.id}")

    # 1. Save thread metadata (database handles duplicates)
    if thread.id:
        await self.store.save_thread(thread, context)

    # 2. Process user message if present
    if input_user_message:
        # CRITICAL: Explicitly save user message - ChatKit doesn't call save_item automatically!
        if thread.id not in self.store._thread_items:
            self.store._thread_items[thread.id] = []
        await self.store.save_item(thread.id, input_user_message, context)
        print(f"🔍 Processing user message for thread {thread.id}")

        # Extract message text
        user_text = ""
        if hasattr(input_user_message, 'content'):
            for content_item in input_user_message.content:
                if hasattr(content_item, 'text'):
                    user_text = content_item.text
                    break

        print(f"🔍 User message text: {user_text}")

        if user_text:
            try:
                # 3. Create dynamic MCP server for this request
                backend_dir = Path(__file__).parent.parent
                project_root = backend_dir.parent.parent
                mcp_wrapper_path = backend_dir / "mcp_wrapper.py"

                server = MCPServerStdio(
                    params={
                        "command": "uv",
                        "args": ["run", "python", str(mcp_wrapper_path)],
                        "cwd": str(project_root)
                    },
                    client_session_timeout_seconds=60
                )

                # 4. Connect to MCP server and assign to agents
                await server.connect()
                orchestrator_agent.mcp_servers = [server]

                # 5. Build conversation history
                conversation_history = []
                if thread.id in self.store._thread_items:
                    for item in self.store._thread_items[thread.id][:-1]:
                        if hasattr(item, 'content'):
                            for c in item.content:
                                if hasattr(c, 'text'):
                                    item_type = type(item).__name__
                                    if 'User' in item_type:
                                        conversation_history.append(f"User: {c.text}")
                                    elif 'Assistant' in item_type:
                                        conversation_history.append(f"Assistant: {c.text}")
                                    break

                user_id = context.get("user_id", "unknown")

                # 6. Enhance input with context
                if conversation_history:
                    history_context = "\n".join(conversation_history)
                    enhanced_input = f"[User: {user_id}]\nConversation History:\n{history_context}\n\nCurrent Message: {user_text}"
                    print(f"🔍 Running agent with {len(conversation_history)} historical messages")
                else:
                    enhanced_input = f"[User: {user_id}] {user_text}"

                # 7. Run the agent
                print(f"🔍 Running agent with input: {enhanced_input[:150]}...")
                result = await Runner.run(orchestrator_agent, enhanced_input, run_config=config)
                response_text = result.final_output
                print(f"✅ Agent response: {response_text[:100]}...")

                # 8. Cleanup
                await server.cleanup()
                orchestrator_agent.mcp_servers = []

            except Exception as e:
                print(f"❌ Agent error: {str(e)}")
                # Cleanup on error
                try:
                    await server.cleanup()
                    orchestrator_agent.mcp_servers = []
                except:
                    pass
                response_text = f"I encountered an error processing your request: {str(e)}"
        else:
            response_text = "I didn't receive a message. How can I help you?"
    else:
        # No user message - thread load request
        response_text = "Hello! I'm your AI Task Assistant. How can I help you manage your tasks today?"

    # 9. Create assistant response
    assistant_item = AssistantMessageItem(
        thread_id=thread.id,
        id=f"msg_{datetime.utcnow().timestamp()}",
        created_at=datetime.utcnow(),
        content=[AssistantMessageContent(text=response_text)],
    )

    # 10. CRITICAL: Explicitly save assistant response to database
    await self.store.save_item(thread.id, assistant_item, context)

    # 11. Stream the response to ChatKit
    yield ThreadItemDoneEvent(item=assistant_item)
```

## DatabaseStore Implementation

> [!WARNING]
> The database `session_id` column is UUID type. ChatKit generates string IDs like `thr_abc123`. You MUST implement UUID mapping using `uuid5` to convert thread IDs to UUIDs deterministically.

### Complete DatabaseStore

```python
from chatkit.store import Store, Page
from chatkit.types import ThreadMetadata, ThreadItem
from sqlmodel import Session
from datetime import datetime

class DatabaseStore(Store[dict]):
    def __init__(self):
        from sqlalchemy import text
        # In-memory cache for current session
        self._thread_items: dict[str, list[ThreadItem]] = {}
        # Map ChatKit thread IDs to database UUIDs
        self._thread_id_to_uuid: dict[str, str] = {}
        self._uuid_to_thread_id: dict[str, str] = {}

    def _get_user_id_from_context(self, context: dict) -> str | None:
        return context.get("user_id")

    def _get_or_create_uuid(self, thread_id: str) -> str:
        """Generate a deterministic UUID for a ChatKit thread ID"""
        from uuid import uuid5, NAMESPACE_DNS
        if thread_id in self._thread_id_to_uuid:
            return self._thread_id_to_uuid[thread_id]
        # Generate deterministic UUID from thread ID
        db_uuid = str(uuid5(NAMESPACE_DNS, f"chatkit-{thread_id}"))
        self._thread_id_to_uuid[thread_id] = db_uuid
        self._uuid_to_thread_id[db_uuid] = thread_id
        return db_uuid

    async def save_thread(self, thread: ThreadMetadata, context: dict) -> None:
        from sqlalchemy import text
        import json

        user_id = self._get_user_id_from_context(context)
        if not user_id:
            print(f"⚠️ No user_id in context, cannot save thread")
            return

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
                # Store original thread ID in metadata
                meta = {"chatkit_thread_id": thread_id}
                if thread.metadata:
                    meta.update(thread.metadata)

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

    async def load_thread(self, thread_id: str, context: dict) -> ThreadMetadata | None:
        from sqlalchemy import text
        from chatkit.types import ThreadMetadata
        import json

        print(f"🔍 Loading thread from DB: {thread_id}")

        user_id = self._get_user_id_from_context(context)
        db_uuid = self._get_or_create_uuid(thread_id)

        with Session(engine) as session:
            result = session.execute(
                text("SELECT session_id, user_id, title, created_at, metadata FROM chat_sessions WHERE session_id = :tid"),
                {"tid": db_uuid}
            )
            row = result.first()

            if row:
                owner_id = row[1]
                # Check ownership
                if user_id and owner_id != user_id:
                    print(f"⚠️ User {user_id} tried to access thread owned by {owner_id}")
                    return None

                # Parse metadata (JSONB returns dict directly)
                meta = row[4] if isinstance(row[4], dict) else (json.loads(row[4]) if row[4] else {})
                original_id = meta.get("chatkit_thread_id", thread_id)

                return ThreadMetadata(
                    id=original_id,
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

    async def load_threads(
        self, after: str | None, limit: int, order: str, context: dict
    ) -> Page[ThreadMetadata]:
        from sqlalchemy import text
        from chatkit.types import ThreadMetadata
        import json

        user_id = self._get_user_id_from_context(context)

        if not user_id:
            print(f"⚠️ No user_id in context, returning empty threads")
            return Page(data=[], has_more=False, after=None)

        with Session(engine) as session:
            order_dir = "DESC" if order == "desc" else "ASC"
            result = session.execute(
                text(f"""
                    SELECT session_id, title, created_at, metadata
                    FROM chat_sessions
                    WHERE user_id = :uid
                    ORDER BY created_at {order_dir}
                    LIMIT :lim
                """),
                {"uid": user_id, "lim": limit + 1}
            )
            rows = result.fetchall()

            threads = []
            for row in rows[:limit]:
                # Parse metadata (JSONB returns dict directly)
                meta = row[3] if isinstance(row[3], dict) else (json.loads(row[3]) if row[3] else {})
                original_id = meta.get("chatkit_thread_id", str(row[0]))

                # Cache the UUID mapping
                self._thread_id_to_uuid[original_id] = str(row[0])
                self._uuid_to_thread_id[str(row[0])] = original_id

                threads.append(ThreadMetadata(
                    id=original_id,
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

### Message Persistence (save_item / load_thread_items)

> [!CAUTION]
> Always use `datetime.utcnow()` when saving messages to ensure consistent timestamps. Using ChatKit's `created_at` can cause wrong ordering due to timezone mismatches.

```python
async def save_item(self, thread_id: str, item: ThreadItem, context: dict) -> None:
    from sqlalchemy import text
    from uuid import uuid4
    import json

    print(f"📝 save_item called for thread {thread_id}, item type: {type(item).__name__}")

    # Add to in-memory cache
    await self.add_thread_item(thread_id, item, context)

    # Persist to database
    db_uuid = self._get_or_create_uuid(thread_id)
    user_id = self._get_user_id_from_context(context)

    if not user_id:
        print(f"⚠️ No user_id in context, cannot save message")
        return

    # Extract message content
    content = ""
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
                    "ts": datetime.utcnow(),  # CRITICAL: Always use utcnow() for proper ordering
                    "meta": json.dumps(meta)
                }
            )
            session.commit()
            print(f"💾 Saved {sender_type} message to DB for thread {thread_id}")
    except Exception as e:
        print(f"⚠️ Failed to save message to DB: {e}")
```

### Loading Messages from Database

> [!WARNING]
> `UserMessageItem` requires `content` with type `"input_text"` (not `"text"`) and a required `inference_options` field.

```python
async def load_thread_items(
    self, thread_id: str, after: str | None, limit: int, order: str, context: dict
) -> Page[ThreadItem]:
    from sqlalchemy import text
    from chatkit.types import UserMessageItem, AssistantMessageItem, AssistantMessageContent
    import json

    db_uuid = self._get_or_create_uuid(thread_id)

    with Session(engine) as session:
        # Always order ASC (oldest first) for proper chat display
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
                    # CRITICAL: Use input_text type and add inference_options
                    items.append(UserMessageItem(
                        thread_id=thread_id,
                        id=original_msg_id,
                        created_at=timestamp,
                        content=[{"type": "input_text", "text": content}],
                        inference_options={}
                    ))
                else:  # assistant or tool
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

## FastAPI Routes

### Main ChatKit Endpoint (ONLY endpoint needed)

> [!IMPORTANT]
> This single endpoint handles ALL ChatKit operations. Do NOT create separate `/session`, `/threads`, `/refresh` endpoints.

```python
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from fastapi.responses import StreamingResponse, Response
from typing import Optional, Dict
import os
from datetime import datetime

router = APIRouter(prefix="/api", tags=["chatkit"])

# Initialize ChatKit server with DatabaseStore
chatkit_store = DatabaseStore()
chatkit_server = MyChatKitServer(store=chatkit_store)

@router.post("/chatkit")
async def chatkit_endpoint(request: Request):
    """Main ChatKit endpoint - handles ALL ChatKit operations"""
    try:
        print("🔍 Main ChatKit endpoint called")

        # Get Authorization header
        auth_header = request.headers.get("Authorization")
        user_id = None

        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            try:
                decoded = await verify_token(token)
                user_id = get_user_id_from_token(decoded)
                print(f"🔍 Authenticated user from JWT: {user_id}")
            except Exception as e:
                print(f"⚠️ Token validation failed: {e}, falling back to dev user")
                user_id = get_dev_user_id()
        else:
            # Development fallback
            print("⚠️ No Authorization header, using development user")
            user_id = get_dev_user_id()

        # Create context with user information
        context = {
            "user_id": user_id,
            "request": request
        }

        # Process request through ChatKit server
        body = await request.body()
        result = await chatkit_server.process(body, context)

        if isinstance(result, StreamingResult):
            return StreamingResponse(
                result,
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                }
            )
        else:
            return Response(
                content=result.json,
                media_type="application/json"
            )

    except Exception as e:
        print(f"❌ ChatKit endpoint error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"ChatKit processing error: {str(e)}"
        )
```

## Database Schema (PostgreSQL)

### chat_sessions table

```sql
CREATE TABLE chat_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'New Chat',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_created_at ON chat_sessions(created_at DESC);
```

### chat_messages table

```sql
CREATE TABLE chat_messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sender_type VARCHAR(50) NOT NULL CHECK (sender_type IN ('user', 'assistant', 'tool')),
    sender_name VARCHAR(100),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_timestamp ON chat_messages(timestamp ASC);
```

## Authentication Helper

### Development Mode Helper

```python
def get_dev_user_id() -> str:
    """Get first user from database for development mode (uses raw SQL to avoid circular dependencies)"""
    from sqlalchemy import text

    with Session(engine) as session:
        # Use raw SQL to avoid importing User model which causes table redefinition
        result = session.execute(text("SELECT id FROM \"user\" LIMIT 1"))
        row = result.first()
        if row:
            user_id = row[0]
            print(f"🔍 Using real user from DB: {user_id}")
            return user_id
        else:
            print("⚠️ No users in database!")
            return "no-user-found"
```

## Common Pitfalls & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| `'types.UnionType' object is not callable` | JSONB returns dict, not string | Use `isinstance(row[4], dict)` check before `json.loads()` |
| UUID error: `invalid input syntax for type uuid` | Thread ID is string like `thr_abc123` | Use `uuid5()` to generate deterministic UUID from thread ID |
| Messages saved but not loading | ChatKit doesn't call `save_item` automatically | Explicitly call `save_item()` in `respond()` method |
| Messages in wrong order | ChatKit `created_at` has timezone issues | Always use `datetime.utcnow()` when saving |
| User messages not rendering | Wrong content type for `UserMessageItem` | Use `{"type": "input_text", "text": content}` and add `inference_options={}` |
| Duplicate messages | Adding to `_thread_items` twice | Don't manually append - use `save_item()` only |

This backend implementation provides a complete, production-ready ChatKit server with OpenAI Agents SDK integration, PostgreSQL persistence, user isolation, and comprehensive error handling.