# ChatKit Backend Patterns

## Overview
This document covers backend implementation patterns for ChatKit using Python, FastAPI, and the OpenAI Agents SDK.

## Project Structure
```
backend/
├── src/backend/
│   ├── main.py           # FastAPI app with ChatKit endpoints
│   ├── store.py          # MemoryStore for development
│   ├── neon_store.py     # PostgreSQL store for production
│   └── chatkit_adapter.py # Optional RAG adapter
└── .env
```

## Dependencies
```bash
# Core ChatKit dependencies
uv add fastapi uvicorn[standard] openai-chatkit openai-agents python-dotenv

# OpenAI API client (REQUIRED for session management)
uv add openai

# PostgreSQL (optional, for production)
uv add psycopg2-binary
```

## OpenAI API Requirements

### Environment Variables
Create a `.env` file in your backend directory:

```bash
# Required: OpenAI API Key for ChatKit sessions
OPENAI_API_KEY=sk-...

# Optional: For custom model providers
# GEMINI_API_KEY=...
# ANTHROPIC_API_KEY=...
```

### Session Management Endpoints
ChatKit requires session creation endpoints for frontend authentication. These endpoints generate `client_secret` tokens that the frontend uses to initialize ChatKit.

#### 1. Session Creation Endpoint
```python
from fastapi import FastAPI, HTTPException
from openai import OpenAI
import os

app = FastAPI()
openai = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@app.post("/api/chatkit/session")
async def create_chatkit_session():
    """
    Creates a new ChatKit session and returns client_secret.
    Frontend calls this endpoint to initialize ChatKit.
    """
    try:
        session = openai.chatkit.sessions.create({
            # Optional: Configure session parameters
            "model": "gpt-4o",
            # Add any other session configuration
        })

        return {
            "client_secret": session.client_secret,
            "session_id": session.id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Session creation failed: {str(e)}")

#### 2. Session Refresh Endpoint
```python
@app.post("/api/chatkit/refresh")
async def refresh_chatkit_session(current_token: dict):
    """
    Refreshes an expired ChatKit session token.
    Frontend calls this when client_secret expires.
    """
    try:
        session = openai.chatkit.sessions.create({
            "model": "gpt-4o",
            # You can include the old session context if needed
        })

        return {
            "client_secret": session.client_secret,
            "session_id": session.id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Session refresh failed: {str(e)}")
```

### Required OpenAI Python Package
The `openai` package is **required** for session management, even if you're using the `openai-chatkit` package for the server implementation:

```python
# Session creation uses the OpenAI client
from openai import OpenAI

# ChatKit server implementation uses chatkit package
from chatkit.server import ChatKitServer
```

### Key Differences from Old Pattern
- **Old**: Used `domainKey` and direct URL configuration
- **New**: Uses `client_secret` tokens from session endpoints
- **Authentication**: Token-based with automatic refresh
- **Security**: Requires OpenAI API key for session generation

## FastAPI Server Setup

### Basic Setup
```python
import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse

from chatkit.server import ChatKitServer, StreamingResult
from chatkit.store import Store
from chatkit.types import ThreadMetadata, ThreadItem, Page
from chatkit.agents import AgentContext, stream_agent_response, ThreadItemConverter

app = FastAPI(title="ChatKit Server")

# CORS MUST be first middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Frontend
        "https://your-production-domain.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### ChatKit Endpoint
```python
@app.post("/api/chatkit")
async def chatkit_endpoint(request: Request):
    # Extract user context from query params or auth
    user_id = request.query_params.get('userId')
    
    # Build context for store operations
    context = {"user": {"id": user_id}}
    
    # Process request
    request_body = await request.body()
    result = await server.process(request_body, context)
    
    if isinstance(result, StreamingResult):
        return StreamingResponse(result, media_type="text/event-stream")
    return Response(content=result.json, media_type="application/json")
```

## ChatKitServer Implementation

### Context Injection Pattern
Extract user and page context from frontend metadata to create personalized responses:

```python
async def respond(self, thread, input, context):
    # Extract metadata from frontend
    metadata = context.get('metadata', {})
    user_info = metadata.get('userInfo', {})
    page_context = metadata.get('pageContext', {})

    # Build personalized instructions
    personalized_instructions = f"""
    You are a helpful assistant.

    ## User Context
    - Name: {user_info.get('name', 'Unknown')}
    - User ID: {user_info.get('id', 'Unknown')}

    ## Page Context
    - Current Page: {page_context.get('title', 'Unknown')}
    - URL: {page_context.get('url', 'Unknown')}
    - Description: {page_context.get('description', 'N/A')}
    - Key Topics: {page_context.get('headings', 'N/A')}

    ## Instructions
    Be helpful and reference the user's context and current page when relevant.
    """

    agent = Agent(
        name="Assistant",
        instructions=personalized_instructions,
        model=self.model
    )

    # ... rest of implementation
```

### Basic Server with Conversation History
```python
from agents import Agent, Runner
from chatkit.server import ChatKitServer
from chatkit.types import AssistantMessageItem
from chatkit.agents import AgentContext, stream_agent_response, ThreadItemConverter

class ChatKitServerImpl(ChatKitServer):
    def __init__(self, store, model):
        super().__init__(store)
        self.store = store
        self.model = model
        self.converter = ThreadItemConverter()  # For conversation history

    async def respond(self, thread, input, context):
        from chatkit.types import (
            ThreadItemAddedEvent, ThreadItemDoneEvent,
            ThreadItemUpdatedEvent, AssistantMessageItem
        )

        # Extract user message
        user_message = ""
        if hasattr(input, 'content') and input.content:
            for content_item in input.content:
                if hasattr(content_item, 'text'):
                    user_message = content_item.text
                    break

        # Extract context from metadata (NEW)
        metadata = context.get('metadata', {})
        user_info = metadata.get('userInfo', {})
        page_context = metadata.get('pageContext', {})

        # Build personalized instructions
        instructions = "You are a helpful assistant."
        if user_info:
            instructions += f"\nUser: {user_info.get('name', 'Unknown')} (ID: {user_info.get('id', 'Unknown')})"
        if page_context:
            instructions += f"\nCurrent page: {page_context.get('title', 'Unknown')}"

        # Create agent with context
        agent = Agent(
            name="Assistant",
            instructions=instructions,
            model=self.model
        )

        # Create agent context
        agent_context = AgentContext(
            thread=thread,
            store=self.store,
            request_context=context,
        )

        # Load conversation history
        page = await self.store.load_thread_items(
            thread.id,
            after=None,
            limit=100,
            order="asc",
            context=context
        )
        all_items = list(page.data)
        
        # Add current input
        if input:
            all_items.append(input)

        # Convert to agent input format
        agent_input = await self.converter.to_agent_input(all_items) if all_items else []

        # Run agent with streaming
        result = Runner.run_streamed(
            agent,
            agent_input,
            context=agent_context,
        )

        # ID mapping for non-OpenAI providers fix
        id_mapping: dict[str, str] = {}

        async for event in stream_agent_response(agent_context, result):
            # Fix ID collisions (required for non-OpenAI providers)
            if event.type == "thread.item.added":
                if isinstance(event.item, AssistantMessageItem):
                    old_id = event.item.id
                    if old_id not in id_mapping:
                        new_id = self.store.generate_item_id("message", thread, context)
                        id_mapping[old_id] = new_id
                    event.item.id = id_mapping[old_id]

            elif event.type == "thread.item.done":
                if isinstance(event.item, AssistantMessageItem):
                    if event.item.id in id_mapping:
                        event.item.id = id_mapping[event.item.id]

            elif event.type == "thread.item.updated":
                if event.item_id in id_mapping:
                    event.item_id = id_mapping[event.item_id]

            yield event
```

## Non-OpenAI Provider ID Collision Fix

When using non-OpenAI providers (Gemini, Anthropic, etc.), message IDs can collide causing messages to overwrite each other. The fix involves:

1. Track all incoming IDs in a mapping
2. Generate unique store IDs for new messages
3. Apply mapping to all event types

```python
# Track ID mappings
id_mapping: dict[str, str] = {}

async for event in stream_agent_response(agent_context, result):
    if event.type == "thread.item.added":
        if isinstance(event.item, AssistantMessageItem):
            old_id = event.item.id
            if old_id not in id_mapping:
                new_id = self.store.generate_item_id("message", thread, context)
                id_mapping[old_id] = new_id
            event.item.id = id_mapping[old_id]
    # ... handle other event types
    yield event
```

## RAG Integration Pattern

Enhance ChatKit with vector search context:

```python
async def respond(self, thread, input, context):
    # Extract query
    user_message = self._extract_message(input)
    
    # Search for relevant context
    search_results = search_chunks(
        collection_name="your_collection",
        query=user_message,
        limit=5,
        score_threshold=0.5
    )
    
    # Build context string
    context_str = "\n\n".join([chunk["text"] for chunk in search_results])
    
    # Create agent with RAG context in instructions
    agent = Agent(
        name="RAGBot",
        instructions=f"""Answer based on this context: {context_str}
        
        If context doesn't contain the answer, say so.""",
        model=self.model
    )
    
    # Continue with normal flow...
```

## httpOnly Cookie Authentication

When using httpOnly cookies for authentication (common in production), the frontend needs a proxy pattern:

### Backend Session Endpoints with Cookie Auth

```python
from fastapi import FastAPI, Request, HTTPException, Header
from fastapi.responses import Response, StreamingResponse
from jose import jwt
import httpx

app = FastAPI()

@app.post("/api/chatkit/session")
async def create_session_with_cookie(request: Request):
    """
    Create ChatKit session using httpOnly cookie authentication.
    """
    # Read httpOnly cookie (server-side only)
    auth_cookie = request.cookies.get("auth_token")

    if not auth_cookie:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Verify JWT token
    try:
        # Verify token with your JWKS endpoint
        payload = verify_jwt_token(auth_cookie)
        user_id = payload.get("sub")

        # Create ChatKit session
        openai = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        session = openai.chatkit.sessions.create({
            "model": "gpt-4o",
            # Include user context in session metadata
            "metadata": {
                "user_id": user_id,
                "auth_source": "httpOnly_cookie"
            }
        })

        return {
            "client_secret": session.client_secret,
            "session_id": session.id,
            "user_id": user_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Session creation failed: {str(e)}")

@app.post("/api/chatkit/refresh")
async def refresh_session_with_cookie(request: Request):
    """
    Refresh ChatKit session using httpOnly cookie.
    """
    auth_cookie = request.cookies.get("auth_token")

    if not auth_cookie:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = verify_jwt_token(auth_cookie)
        user_id = payload.get("sub")

        openai = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        session = openai.chatkit.sessions.create({
            "model": "gpt-4o",
            "metadata": {"user_id": user_id}
        })

        return {
            "client_secret": session.client_secret,
            "session_id": session.id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Session refresh failed: {str(e)}")

def verify_jwt_token(token: str) -> dict:
    """Verify JWT token from cookie."""
    # Implement your JWT verification logic
    # This might involve fetching JWKS from your auth provider
    # For example, if using Auth0, Better Auth, etc.
    try:
        # Example with JWKS
        jwks = fetch_jwks()
        payload = jwt.decode(token, jwks, algorithms=["RS256"])
        return payload
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

def fetch_jwks():
    """Fetch JWKS from auth provider."""
    # Implement based on your auth provider
    pass
```

### Frontend Proxy Pattern

See FRONTEND_PATTERNS.md for the complete frontend implementation that:
1. Uses `/api/chatkit` as the URL (proxy endpoint)
2. Sets `credentials: 'include'` to send cookies
3. Injects context via custom fetch interceptor

## User Profile Personalization

```python
# Extract user profile from context
user = context.get('user', {})
if user:
    user_profile_context = f"""
    The user has the following background:
    - Education level: {user.get('educationLevel', 'Not specified')}
    - Programming experience: {user.get('programmingExperience', 'Not specified')}

    Tailor your explanations to match their experience level.
    """

    agent = Agent(
        name="PersonalizedBot",
        instructions=f"{user_profile_context}\n\nYou are a helpful assistant.",
        model=self.model
    )
```

## Model Configuration

### Using Gemini (via OpenAI-compatible endpoint)
```python
from agents import AsyncOpenAI, OpenAIChatCompletionsModel, RunConfig

# Create client with Gemini's OpenAI-compatible endpoint
client = AsyncOpenAI(
    api_key=os.getenv("GEMINI_API_KEY"),
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

# Create model
model = OpenAIChatCompletionsModel(
    model="gemini-2.5-flash",
    openai_client=client
)

# Configure run settings
config = RunConfig(
    model=model,
    model_provider=client,
)
```

### Using OpenAI
```python
from agents import AsyncOpenAI, OpenAIChatCompletionsModel

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
model = OpenAIChatCompletionsModel(
    model="gpt-4o",
    openai_client=client
)
```

> **Note**: The ID collision fix is required when using non-OpenAI providers like Gemini.

## Debug Endpoint
```python
@app.get("/debug/threads")
async def debug_threads():
    result = {}
    for thread_id, state in store._threads.items():
        items = []
        for item in state.items:
            item_data = {"id": item.id, "type": type(item).__name__}
            if hasattr(item, 'content') and item.content:
                content_parts = [str(part) for part in item.content if hasattr(part, 'text')]
                item_data["content"] = content_parts
            items.append(item_data)
        result[thread_id] = {"items": items, "count": len(items)}
    return result
```
