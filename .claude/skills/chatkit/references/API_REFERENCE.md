# ChatKit API Reference

## Core Imports

### Backend (Python)
```python
# Server
from chatkit.server import ChatKitServer, StreamingResult

# Store
from chatkit.store import Store  # SINGULAR!

# Types
from chatkit.types import (
    ThreadMetadata,
    ThreadItem,
    Page,
    AssistantMessageItem,
    UserMessageItem,
)

# Agents
from chatkit.agents import (
    AgentContext,
    stream_agent_response,
    ThreadItemConverter,
)

# Events (for ID mapping)
from chatkit.types import (
    ThreadItemAddedEvent,
    ThreadItemDoneEvent,
    ThreadItemUpdatedEvent,
)

# NEW: Required for session management
from openai import OpenAI
```

### Frontend (TypeScript)
```typescript
import { ChatKit, useChatKit } from '@openai/chatkit-react';
```

---

## Session Management Endpoints

These endpoints are **required** for frontend authentication and session management.

### POST /api/chatkit/session
Creates a new ChatKit session and returns a `client_secret` for frontend authentication.

```python
from fastapi import FastAPI, HTTPException
from openai import OpenAI
import os

app = FastAPI()
openai = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@app.post("/api/chatkit/session")
async def create_chatkit_session():
    """
    Creates a new ChatKit session.
    Returns: { "client_secret": str, "session_id": str }
    """
    try:
        session = openai.chatkit.sessions.create({
            "model": "gpt-4o",
            # Optional: Add session configuration
        })
        return {
            "client_secret": session.client_secret,
            "session_id": session.id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### POST /api/chatkit/refresh
Refreshes an expired ChatKit session token.

```python
@app.post("/api/chatkit/refresh")
async def refresh_chatkit_session(current_token: dict):
    """
    Refreshes expired session tokens.
    Returns: { "client_secret": str, "session_id": str }
    """
    try:
        session = openai.chatkit.sessions.create({
            "model": "gpt-4o",
        })
        return {
            "client_secret": session.client_secret,
            "session_id": session.id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## ChatKitServer

Base class for implementing a ChatKit server.

```python
class ChatKitServer(Generic[ContextT]):
    def __init__(self, store: Store[ContextT]) -> None: ...
    
    async def process(
        self, 
        body: bytes, 
        context: ContextT
    ) -> StreamingResult | JSONResult: ...
    
    async def respond(
        self, 
        thread: ThreadMetadata, 
        input: Any, 
        context: ContextT
    ) -> AsyncIterator: ...  # MUST implement in subclass
```

### Usage
```python
class MyServer(ChatKitServer[dict]):
    async def respond(self, thread, input, context):
        # Your implementation
        yield event
```

---

## Store Abstract Methods

All 14 methods MUST be implemented:

```python
class Store(Generic[ContextT], ABC):
    # ID Generation
    @abstractmethod
    def generate_thread_id(self, context: ContextT) -> str: ...
    
    @abstractmethod
    def generate_item_id(
        self, 
        item_type: str, 
        thread: ThreadMetadata, 
        context: ContextT
    ) -> str: ...

    # Thread Operations
    @abstractmethod
    async def load_thread(
        self, 
        thread_id: str, 
        context: ContextT
    ) -> ThreadMetadata: ...
    
    @abstractmethod
    async def save_thread(
        self, 
        thread: ThreadMetadata, 
        context: ContextT
    ) -> None: ...
    
    @abstractmethod
    async def load_threads(
        self, 
        limit: int, 
        after: str | None, 
        order: str, 
        context: ContextT
    ) -> Page[ThreadMetadata]: ...
    
    @abstractmethod
    async def delete_thread(
        self, 
        thread_id: str, 
        context: ContextT
    ) -> None: ...

    # Item Operations
    @abstractmethod
    async def load_thread_items(
        self,
        thread_id: str,
        after: str | None,
        limit: int,
        order: str,
        context: ContextT,
    ) -> Page[ThreadItem]: ...
    
    @abstractmethod
    async def add_thread_item(
        self, 
        thread_id: str, 
        item: ThreadItem, 
        context: ContextT
    ) -> None: ...
    
    @abstractmethod
    async def save_item(
        self, 
        thread_id: str, 
        item: ThreadItem, 
        context: ContextT
    ) -> None: ...
    
    @abstractmethod
    async def load_item(
        self, 
        thread_id: str, 
        item_id: str, 
        context: ContextT
    ) -> ThreadItem: ...
    
    @abstractmethod
    async def delete_thread_item(
        self, 
        thread_id: str, 
        item_id: str, 
        context: ContextT
    ) -> None: ...

    # Attachment Operations
    @abstractmethod
    async def save_attachment(
        self, 
        attachment: Any, 
        context: ContextT
    ) -> None: ...
    
    @abstractmethod
    async def load_attachment(
        self, 
        attachment_id: str, 
        context: ContextT
    ) -> Any: ...
    
    @abstractmethod
    async def delete_attachment(
        self, 
        attachment_id: str, 
        context: ContextT
    ) -> None: ...
```

---

## Types

### ThreadMetadata
```python
class ThreadMetadata:
    id: str
    created_at: datetime
    metadata: dict  # Custom metadata
```

### ThreadItem
Base class for `UserMessageItem` and `AssistantMessageItem`.

### Page
```python
class Page(Generic[T]):
    data: list[T]
    has_more: bool
    after: str | None  # Cursor for pagination
```

### AssistantMessageItem
```python
class AssistantMessageItem:
    id: str
    thread_id: str
    created_at: datetime
    content: list[ContentPart]
```

### UserMessageItem
```python
class UserMessageItem:
    id: str
    thread_id: str
    created_at: datetime
    content: list[ContentPart]
    inference_options: dict  # Required field!
```

---

## Agent Helpers

### AgentContext
```python
class AgentContext:
    thread: ThreadMetadata
    store: Store
    request_context: Any
```

### ThreadItemConverter
```python
class ThreadItemConverter:
    async def to_agent_input(
        self, 
        items: list[ThreadItem]
    ) -> list[AgentInputItem]: ...
```

### stream_agent_response
```python
async def stream_agent_response(
    context: AgentContext,
    result: RunResult,
) -> AsyncIterator[Event]: ...
```

---

## useChatKit Hook (React)

```typescript
interface UseChatKitOptions {
  api: {
    url?: string;
    domainKey?: string;
    headers?: Record<string, string>;

    // NEW: Token-based authentication (required)
    getClientSecret?: (existing: string | null) => Promise<string>;

    // NEW: Custom fetch interceptor for auth and context injection
    fetch?: (url: string, options: RequestInit) => Promise<Response>;
  };

  initialThread?: string | null;

  theme?: {
    colorScheme: 'dark' | 'light';
    color?: {
      grayscale?: { hue: number; tint: number; shade: number };
      accent?: { primary: string; level: number };
    };
    radius?: 'round' | 'square';
  };

  startScreen?: {
    greeting?: string;
    prompts?: Array<{ label: string; prompt: string }>;
  };

  composer?: {
    placeholder?: string;
    // NEW: Composer tools for UI interaction modes
    tools?: Array<{
      id: string;
      label: string;
      shortLabel?: string;
      icon?: string;
      placeholderOverride?: string;
      pinned?: boolean;
    }>;
  };

  // NEW: Thread lifecycle events
  onThreadChange?: (data: { threadId: string | null }) => void;

  // NEW: Error handling
  onError?: (data: { error: Error }) => void;

  // NEW: Client-side tool execution
  onClientTool?: (toolCall: {
    name: string;
    params: Record<string, any>;
  }) => Promise<any>;

  // NEW: Widget action handler
  widgets?: {
    onAction?: (action: {
      type: string;
      payload?: any;
    }, widgetItem: any) => Promise<void>;
  };
}

function useChatKit(options: UseChatKitOptions): {
  control: ChatKitControl;
  sendUserMessage?: (message: { text: string }) => Promise<void>;
  sendCustomAction?: (action: { type: string; payload?: any }) => Promise<void>;
};
```

### Enhanced API Configuration Examples

#### 1. Basic Token Authentication
```typescript
api: {
  async getClientSecret(existing) {
    const res = await fetch('/api/chatkit/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const { client_secret } = await res.json();
    return client_secret;
  }
}
```

#### 2. Custom Fetch with Context Injection
```typescript
api: {
  url: '/api/chatkit',
  fetch: async (url, options) => {
    const userId = user.id;
    const pageContext = getPageContext();

    let modifiedOptions = { ...options };
    if (modifiedOptions.body && typeof modifiedOptions.body === 'string') {
      const parsed = JSON.parse(modifiedOptions.body);
      if (parsed.params?.input) {
        parsed.params.input.metadata = {
          userId,
          userInfo: { id: userId, name: user.name },
          pageContext,
          ...parsed.params.input.metadata,
        };
        modifiedOptions.body = JSON.stringify(parsed);
      }
    }

    return fetch(url, {
      ...modifiedOptions,
      headers: {
        ...modifiedOptions.headers,
        'X-User-ID': userId,
        'Content-Type': 'application/json',
      },
    });
  }
}
```

#### 3. httpOnly Cookie Proxy
```typescript
api: {
  url: '/api/chatkit', // Next.js proxy route
  fetch: async (input, options) => {
    return fetch(input, {
      ...options,
      credentials: 'include', // Send cookies
      headers: {
        ...options?.headers,
        'Content-Type': 'application/json',
      },
    });
  }
}
```

---

## Event Types

Events yielded from `stream_agent_response`:

```python
# When a new item is added
ThreadItemAddedEvent:
    type: "thread.item.added"
    item: ThreadItem

# When an item is complete
ThreadItemDoneEvent:
    type: "thread.item.done"
    item: ThreadItem

# When an item is updated (streaming)
ThreadItemUpdatedEvent:
    type: "thread.item.updated"
    item_id: str
    content: Any
```

---

## Tool Integration Methods

### Client-Side Tools (React Hook)

```typescript
interface UseChatKitOptions {
  // ... other options

  onClientTool?: (toolCall: {
    name: string;
    params: Record<string, any>;
  }) => Promise<any>;

  composer?: {
    tools?: Array<{
      id: string;
      label: string;
      shortLabel?: string;
      icon?: string;
      placeholderOverride?: string;
      pinned?: boolean;
    }>;
    placeholder?: string;
  };

  widgets?: {
    onAction?: (action: {
      type: string;
      payload?: any;
    }, widgetItem: any) => Promise<void>;
  };
}
```

### Custom Actions (Imperative)

```typescript
interface ChatKitControl {
  // Send custom action to backend
  sendCustomAction(
    action: { type: string; payload?: any },
    widgetId?: string
  ): Promise<void>;

  // Other methods
  focusComposer(): Promise<void>;
  setThreadId(threadId: string | null): Promise<void>;
  sendUserMessage(message: { text: string }): Promise<void>;
  setComposerValue(value: { text: string }): Promise<void>;
  fetchUpdates(): Promise<void>;
}
```

### Web Component Tools

```typescript
interface OpenAIChatKit {
  setOptions(options: {
    api: { clientToken: string };
    onClientTool?: (toolCall: {
      name: string;
      params: Record<string, any>;
    }) => Promise<any>;
    composer?: {
      tools?: Array<{
        id: string;
        label: string;
        icon?: string;
        pinned?: boolean;
      }>;
    };
  }): Promise<void>;

  // Imperative methods
  focusComposer(): Promise<void>;
  sendUserMessage(message: { text: string }): Promise<void>;
  sendCustomAction(action: { type: string; payload?: any }): Promise<void>;
}
```

### Tool Call Types

```typescript
// Tool call received from AI
type ToolCall = {
  name: string;
  params: Record<string, any>;
};

// Tool response sent back to AI
type ToolResponse = {
  success?: boolean;
  error?: string;
  [key: string]: any;
};

// Composer tool configuration
type ComposerTool = {
  id: string;
  label: string;
  shortLabel?: string;
  icon?: string;
  placeholderOverride?: string;
  pinned?: boolean;
};
```

### Widget Actions

```typescript
// For interactive widgets
type WidgetAction = {
  type: string;
  payload?: any;
};

type WidgetItem = {
  id: string;
  type: string;
  content: any;
};
```
