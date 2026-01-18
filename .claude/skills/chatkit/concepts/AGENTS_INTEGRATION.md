# OpenAI Agents SDK Integration

Complete integration patterns for OpenAI Agents SDK with ChatKit and MCP tools.

## Agent Configuration

### Client Setup

```python
from agents import AsyncOpenAI, OpenAIChatCompletionsModel, RunConfig
import os

# Configure client for Xiaomi model
api_key = os.environ.get("XIAOMI_API_KEY")
if not api_key:
    raise ValueError("XIAOMI_API_KEY not found in environment")

client = AsyncOpenAI(
    api_key=api_key,
    base_url="https://api.xiaomimimo.com/v1/"
)

model = OpenAIChatCompletionsModel(
    model="mimo-v2-flash",
    openai_client=client
)

config = RunConfig(model=model, model_provider=client)
```

### Environment Variables

```bash
# .env file
XIAOMI_API_KEY=xm-...           # Required for Agents SDK
OPENAI_API_KEY=sk-...           # Required for ChatKit Sessions API
DATABASE_URL=postgresql://...   # Required for persistence
ENVIRONMENT=development         # or production
```

## Agent Definitions

### Main Orchestrator Agent

```python
from agents import Agent

orchestrator_agent = Agent(
    name="Task Orchestrator",
    instructions="""You are the main coordinator for task management.

    **LANGUAGE HANDLING:**
    - If user message contains URDU CHARACTERS (آ, ب, پ, ت, ث, ج, چ, ح, خ, د, ذ, ر, ز, س, ش, ص, ض, ط, ظ, ع, غ, ف, ق, ک, گ, ل, م, ن, و, ه, ی, ے) → Respond in URDU
    - If user message is in English → Respond in ENGLISH
    - Handle ALL task management operations directly - do NOT handoff

    **TOOL USAGE:**
    - You have access to all task management tools
    - Call tools immediately when users ask to create, list, update, delete tasks
    - Don't describe what you'll do - just do it

    **EXAMPLES:**
    - "Create a task: Buy milk" → Call create_task, respond in English
    - "سلام! نیا ٹاسک بنائیں" → Call create_task, respond in Urdu
    - "List my tasks" → Call list_tasks, respond in English
    - "تمام ٹاسکس دکھائیں" → Call list_tasks, respond in Urdu
    - "Update task with ID 123" → Call update_task, respond in English
    - "اس ٹاسک کو اپڈیٹ کریں" → Call update_task, respond in Urdu

    **IMPORTANT:**
    - NO handoffs to Urdu agent
    - Handle everything directly
    - Match response language to user message language

    **FORMATTING RULES:**
    - Use proper line breaks between different sections
    - Add blank lines between tasks for readability
    - Use clear headings with spacing
    - Don't cram everything together
    - Make responses easy to read with proper spacing""",
    model=model,
    handoffs=[urdu_agent]  # Optional handoff target
)
```

### Urdu Specialist Agent

```python
urdu_agent = Agent(
    name="Urdu Specialist",
    instructions="""You are a Urdu language specialist. Respond EXCLUSIVELY in Urdu.

    **CRITICAL: When users ask to create, update, delete, or list tasks, you MUST call the corresponding MCP tool immediately. Do NOT describe what you would do - actually do it.**

    **TOOL USAGE RULES:**
    - If user says "create a task" or "بنائیں" or "نیا ٹاسک" → Call create_task tool immediately
    - If user says "list tasks" or "تمام ٹاسکس" or "فہرست" → Call list_tasks tool immediately
    - If user says "delete task" or "حذف کریں" → Call delete_task tool immediately
    - If user says "update task" or "تبدیلی" → Call update_task tool immediately

    **IMPORTANT:**
    - Call tools FIRST, then respond in Urdu about the result
    - Don't say "I will create..." - just create it and say "ٹاسک بن گیا"
    - Use the tool parameters exactly as requested by user

    **FORMATTING RULES:**
    - Use proper line breaks between different sections
    - Add blank lines between tasks for readability
    - Use clear headings with spacing
    - Don't cram everything together

    You have access to MCP tools for task management. Always use them when users ask about tasks.

    Always provide helpful, culturally appropriate responses in Urdu AFTER tool calls.""",
    model=model
)
```

## MCP Tool Integration

### MCP Server Creation

```python
from agents.mcp import MCPServerStdio
from pathlib import Path

async def create_mcp_server(self) -> MCPServerStdio:
    """Create dynamic MCP server for this request"""
    backend_dir = Path(__file__).parent
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

    await server.connect()
    return server
```

### MCP Wrapper Script

```python
#!/usr/bin/env python3
"""MCP server wrapper that loads environment variables before starting the server"""
import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Load environment variables
env_path = backend_dir.parent.parent / '.env'
if env_path.exists():
    from dotenv import load_dotenv
    load_dotenv(env_path)

# Import and run the actual MCP server
from your_mcp_tools_module import mcp  # Replace with your MCP tools module

if __name__ == "__main__":
    mcp.run(transport="stdio")
```

### MCP Tools Implementation

```python
# task_serves_mcp_tools.py
from mcp.server import Server
from mcp.server.stdio import stdio_server
from typing import List, Dict, Any
import json

# Create MCP server
mcp = Server("task-management-tools")

@mcp.tool()
async def create_task(task_description: str, priority: str = "medium") -> str:
    """Create a new task with description and priority"""
    # Implementation for creating task
    # This would interact with your task database
    return f"Task created: {task_description} with priority {priority}"

@mcp.tool()
async def list_tasks() -> str:
    """List all current tasks"""
    # Implementation for listing tasks
    return "List of tasks: ..."

@mcp.tool()
async def update_task(task_id: str, updates: Dict[str, Any]) -> str:
    """Update existing task"""
    # Implementation for updating task
    return f"Task {task_id} updated"

@mcp.tool()
async def delete_task(task_id: str) -> str:
    """Delete a task by ID"""
    # Implementation for deleting task
    return f"Task {task_id} deleted"

# Export the MCP server
__all__ = ["mcp"]
```

## Agent Execution Patterns

### Basic Agent Run

```python
from agents import Runner

async def run_agent_simple(user_input: str, user_id: str) -> str:
    """Run agent with basic input"""
    # Enhance input with user context
    enhanced_input = f"[User: {user_id}] {user_input}"

    # Run the agent
    result = await Runner.run(orchestrator_agent, enhanced_input, run_config=config)

    return result.final_output
```

### Agent Run with MCP Tools

```python
async def run_agent_with_mcp(user_input: str, user_id: str) -> str:
    """Run agent with MCP tools available"""
    # Create MCP server
    server = await create_mcp_server()

    try:
        # Assign MCP servers to agent
        orchestrator_agent.mcp_servers = [server]

        # Enhance input with user context
        enhanced_input = f"[User: {user_id}] {user_input}"

        # Run the agent
        result = await Runner.run(orchestrator_agent, enhanced_input, run_config=config)

        return result.final_output

    finally:
        # Cleanup
        await server.cleanup()
        orchestrator_agent.mcp_servers = []
```

### Agent Run with Conversation History

```python
async def run_agent_with_history(
    user_input: str,
    user_id: str,
    conversation_history: List[str]
) -> str:
    """Run agent with conversation history"""
    # Create MCP server
    server = await create_mcp_server()

    try:
        # Assign MCP servers to agent
        orchestrator_agent.mcp_servers = [server]

        # Build enhanced input with history
        if conversation_history:
            history_context = "\n".join(conversation_history)
            enhanced_input = f"[User: {user_id}]\nConversation History:\n{history_context}\n\nCurrent Message: {user_input}"
        else:
            enhanced_input = f"[User: {user_id}] {user_input}"

        # Run the agent
        result = await Runner.run(orchestrator_agent, enhanced_input, run_config=config)

        return result.final_output

    finally:
        # Cleanup
        await server.cleanup()
        orchestrator_agent.mcp_servers = []
```

## Integration with ChatKit

### Complete ChatKit Server respond() Method

```python
from chatkit.server import ChatKitServer
from chatkit.types import (
    ThreadMetadata, UserMessageItem, AssistantMessageItem,
    AssistantMessageContent, ThreadStreamEvent, ThreadItemDoneEvent
)
from agents import Runner
from agents.mcp import MCPServerStdio
from datetime import datetime
from typing import AsyncIterator
from pathlib import Path

class MyChatKitServer(ChatKitServer[dict]):
    def __init__(self, store):
        super().__init__(store=store)
        self.store = store

    async def respond(
        self,
        thread: ThreadMetadata,
        input_user_message: UserMessageItem | None,
        context: dict,
    ) -> AsyncIterator[ThreadStreamEvent]:
        """Handle ChatKit requests and stream responses using agent system"""
        print(f"🔍 ChatKit server processing thread: {thread.id}")

        # 1. Save thread if new
        if thread.id:
            await self.store.save_thread(thread, context)

        # 2. Process user message if present
        if input_user_message:
            # Save user message
            if thread.id not in self.store._thread_items:
                self.store._thread_items[thread.id] = []
            await self.store.save_item(thread.id, input_user_message, context)

            # Extract message text
            user_text = self._extract_message_text(input_user_message)
            print(f"🔍 Processing user message: {user_text}")

            try:
                # 3. Create MCP server
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

                # 4. Connect and assign MCP servers
                await server.connect()
                orchestrator_agent.mcp_servers = [server]

                # 5. Build conversation history
                conversation_history = self._build_conversation_history(thread.id)
                user_id = context.get("user_id", "unknown")

                # 6. Enhance input
                if conversation_history:
                    history_context = "\n".join(conversation_history)
                    enhanced_input = f"[User: {user_id}]\nConversation History:\n{history_context}\n\nCurrent Message: {user_text}"
                else:
                    enhanced_input = f"[User: {user_id}] {user_text}"

                # 7. Run agent
                print(f"🔍 Running agent with input: {enhanced_input[:150]}...")
                result = await Runner.run(orchestrator_agent, enhanced_input, run_config=config)
                response_text = result.final_output
                print(f"✅ Agent response: {response_text[:100]}...")

            except Exception as e:
                print(f"❌ Agent error: {str(e)}")
                response_text = f"I encountered an error processing your request: {str(e)}"

            finally:
                # 8. Cleanup
                if 'server' in locals():
                    await server.cleanup()
                orchestrator_agent.mcp_servers = []

        else:
            # No user message - thread load request
            response_text = "Hello! I'm your AI Assistant. How can I help you today?"

        # 9. Create assistant response
        assistant_item = AssistantMessageItem(
            thread_id=thread.id,
            id=f"msg_{datetime.utcnow().timestamp()}",
            created_at=datetime.utcnow(),
            content=[AssistantMessageContent(text=response_text)],
        )

        # 10. Save assistant response
        await self.store.save_item(thread.id, assistant_item, context)

        # 11. Stream response
        yield ThreadItemDoneEvent(item=assistant_item)

    def _extract_message_text(self, message: UserMessageItem) -> str:
        """Extract text from UserMessageItem"""
        if not hasattr(message, 'content'):
            return ""

        for content_item in message.content:
            if hasattr(content_item, 'text'):
                return content_item.text
            elif hasattr(content_item, 'type') and content_item.type == 'input_text':
                return content_item.text

        return ""

    def _build_conversation_history(self, thread_id: str) -> list[str]:
        """Build conversation history from thread items"""
        conversation_history = []

        if thread_id in self.store._thread_items:
            # Exclude current message (last item)
            for item in self.store._thread_items[thread_id][:-1]:
                if hasattr(item, 'content'):
                    item_text = self._extract_message_text(item)

                    if hasattr(item, '__class__'):
                        class_name = item.__class__.__name__
                        if 'User' in class_name:
                            conversation_history.append(f"User: {item_text}")
                        elif 'Assistant' in class_name:
                            conversation_history.append(f"Assistant: {item_text}")

        return conversation_history
```

## Language Detection

**Note**: Language detection is handled through agent instructions, not separate utility functions.

Your implementation uses agent instructions to detect language based on Urdu characters:

```python
orchestrator_agent = Agent(
    name="AI Assistant",
    instructions="""You are a helpful AI assistant.

    **LANGUAGE HANDLING:**
    - If user message contains URDU CHARACTERS (آ, ب, پ, ت, ث, ج, چ, ح, خ, د, ذ, ر, ز, س, ش, ص, ض, ط, ظ, ع, غ, ف, ق, ک, گ, ل, م, ن, و, ه, ی, ے) → Respond in URDU
    - If user message is in English → Respond in ENGLISH
    - Handle ALL operations directly - do NOT handoff

    **IMPORTANT:**
    - Match response language to user message language
    - Handle everything directly
    """,
    model=model
)
```

This approach keeps language detection simple and centralized in the agent's instructions rather than requiring separate utility functions.

## Error Handling

### Agent Execution Errors

```python
async def safe_agent_execution(user_input: str, user_id: str) -> str:
    """Run agent with comprehensive error handling"""
    server = None
    try:
        # Create MCP server
        server = await create_mcp_server()
        orchestrator_agent.mcp_servers = [server]

        # Run agent
        enhanced_input = f"[User: {user_id}] {user_input}"
        result = await Runner.run(orchestrator_agent, enhanced_input, run_config=config)

        return result.final_output

    except Exception as e:
        print(f"❌ Agent execution failed: {str(e)}")
        # Return user-friendly error message
        return f"I encountered an error processing your request: {str(e)}"

    finally:
        # Always cleanup
        if server:
            await server.cleanup()
        orchestrator_agent.mcp_servers = []
```

### MCP Server Errors

```python
async def create_mcp_server_with_retry(max_retries: int = 3) -> MCPServerStdio:
    """Create MCP server with retry logic"""
    for attempt in range(max_retries):
        try:
            server = await create_mcp_server()
            return server
        except Exception as e:
            print(f"❌ Failed to create MCP server (attempt {attempt + 1}): {str(e)}")
            if attempt == max_retries - 1:
                raise
            # Wait before retry
            import asyncio
            await asyncio.sleep(1)

    raise RuntimeError("Failed to create MCP server after all retries")
```

## Performance Optimizations

### Connection Pooling

```python
from agents.mcp import MCPServerStdio
from contextlib import asynccontextmanager

@asynccontextmanager
async def get_mcp_server():
    """Context manager for MCP server with automatic cleanup"""
    server = None
    try:
        server = await create_mcp_server()
        yield server
    finally:
        if server:
            await server.cleanup()

# Usage
async def run_with_mcp_server(user_input: str, user_id: str) -> str:
    async with get_mcp_server() as server:
        orchestrator_agent.mcp_servers = [server]
        enhanced_input = f"[User: {user_id}] {user_input}"
        result = await Runner.run(orchestrator_agent, enhanced_input, run_config=config)
        return result.final_output
```

### Caching Agent Results

```python
from functools import lru_cache
import hashlib

@lru_cache(maxsize=100)
def get_cached_agent_response(input_hash: str) -> str:
    """Cache agent responses for identical inputs"""
    # This is a simplified example - in production, use Redis or similar
    pass

def hash_input(user_input: str, user_id: str, history: tuple = ()) -> str:
    """Create hash for caching"""
    content = f"{user_id}:{user_input}:{':'.join(history)}"
    return hashlib.md5(content.encode()).hexdigest()
```

## Testing

### Unit Tests for Agents

```python
import pytest
from unittest.mock import AsyncMock, patch

@pytest.mark.asyncio
async def test_orchestrator_agent_english():
    """Test orchestrator agent with English input"""
    mock_result = AsyncMock()
    mock_result.final_output = "Task created successfully"

    with patch('agents.Runner.run', return_value=mock_result) as mock_run:
        result = await run_agent_simple("Create a task: Buy milk", "user-123")

        assert result == "Task created successfully"
        mock_run.assert_called_once()

@pytest.mark.asyncio
async def test_orchestrator_agent_urdu():
    """Test orchestrator agent with Urdu input"""
    mock_result = AsyncMock()
    mock_result.final_output = "ٹاسک بن گیا"

    with patch('agents.Runner.run', return_value=mock_result) as mock_run:
        result = await run_agent_simple("نیا ٹاسک بنائیں", "user-123")

        assert result == "ٹاسک بن گیا"
        mock_run.assert_called_once()
```

### Integration Tests

```python
@pytest.mark.asyncio
async def test_full_agent_integration():
    """Test complete agent integration with MCP tools"""
    # Create test MCP server
    server = await create_mcp_server()

    try:
        orchestrator_agent.mcp_servers = [server]

        # Test task creation
        result = await Runner.run(
            orchestrator_agent,
            "[User: test-user] Create a task: Buy groceries",
            run_config=config
        )

        assert result.final_output is not None
        assert len(result.final_output) > 0

    finally:
        await server.cleanup()
        orchestrator_agent.mcp_servers = []
```

## Production Deployment

### Environment Configuration

```python
# config.py
import os
from agents import AsyncOpenAI, OpenAIChatCompletionsModel, RunConfig

def get_agent_config() -> RunConfig:
    """Get agent configuration for current environment"""
    api_key = os.environ.get("XIAOMI_API_KEY")

    if not api_key:
        raise ValueError("XIAOMI_API_KEY is required")

    # Use different models based on environment
    environment = os.getenv("ENVIRONMENT", "development")
    model_name = "mimo-v2-flash"  # Could vary by environment

    client = AsyncOpenAI(
        api_key=api_key,
        base_url="https://api.xiaomimimo.com/v1/"
    )

    model = OpenAIChatCompletionsModel(
        model=model_name,
        openai_client=client
    )

    return RunConfig(model=model, model_provider=client)
```

### Monitoring & Logging

```python
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def run_agent_with_monitoring(user_input: str, user_id: str) -> str:
    """Run agent with comprehensive monitoring"""
    start_time = datetime.utcnow()

    try:
        logger.info(f"Agent execution started for user {user_id}")
        result = await run_agent_simple(user_input, user_id)

        duration = (datetime.utcnow() - start_time).total_seconds()
        logger.info(f"Agent execution completed in {duration:.2f}s for user {user_id}")

        return result

    except Exception as e:
        duration = (datetime.utcnow() - start_time).total_seconds()
        logger.error(f"Agent execution failed after {duration:.2f}s for user {user_id}: {str(e)}")
        raise
```

### Rate Limiting

```python
from collections import defaultdict
from datetime import datetime, timedelta
import asyncio

class RateLimiter:
    def __init__(self, max_requests: int = 10, window: int = 60):
        self.max_requests = max_requests
        self.window = window
        self.requests = defaultdict(list)

    async def acquire(self, user_id: str) -> bool:
        """Acquire rate limit permission"""
        now = datetime.utcnow()
        window_start = now - timedelta(seconds=self.window)

        # Clean old requests
        self.requests[user_id] = [
            req_time for req_time in self.requests[user_id]
            if req_time > window_start
        ]

        # Check if limit exceeded
        if len(self.requests[user_id]) >= self.max_requests:
            return False

        # Add current request
        self.requests[user_id].append(now)
        return True

# Usage
rate_limiter = RateLimiter(max_requests=5, window=60)  # 5 requests per minute

async def run_agent_with_rate_limit(user_input: str, user_id: str) -> str:
    """Run agent with rate limiting"""
    if not await rate_limiter.acquire(user_id):
        raise Exception("Rate limit exceeded. Please try again later.")

    return await run_agent_simple(user_input, user_id)
```

This integration provides a complete, production-ready OpenAI Agents SDK implementation with MCP tools, language detection, error handling, and performance optimizations.