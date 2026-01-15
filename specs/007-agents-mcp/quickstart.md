# Quickstart: MCP Agent Integration

**Date**: 2026-01-13
**Branch**: 007-agents-mcp
**Feature**: Phase 3 MCP Agent Integration Specification

## Overview

This quickstart guide provides step-by-step instructions to implement the MCP Agent Integration system. The implementation follows a three-phase approach: Agent Foundation → MCP Integration → Frontend UI.

## Prerequisites

### Environment Requirements
- **Python**: 3.12+ (already configured in phase-3)
- **Node.js**: 18+ (already configured in phase-3)
- **UV**: Latest version (for backend)
- **Neon PostgreSQL**: Active database instance
- **Xiaomi API Key**: For mimo-v2-flash model access

### Existing Infrastructure
- ✅ FastAPI backend with SQLModel
- ✅ Next.js 16+ frontend with Better Auth
- ✅ Neon PostgreSQL database
- ✅ JWT authentication system
- ✅ Task CRUD operations

## Phase 1: Agent Foundation

### Step 1.1: Install Dependencies

**Backend (FastAPI)**:
```bash
cd phase-3/backend
uv add openai-agents>=0.6.5
uv add mcp>=0.6.5
```

**Frontend (Next.js)**:
```bash
cd phase-3/frontend
# No new dependencies needed - uses existing HTTP client
```

### Step 1.2: Create Agent System

**File**: `backend/src/backend/agents.py`

```python
"""
Dual-Agent System: Orchestrator + Urdu Specialist
"""
from agents import Agent, Runner, OpenAIChatCompletionsModel
from agents import AsyncOpenAI
import os

# Xiaomi mimo-v2-flash client
client = AsyncOpenAI(
    api_key=os.environ["XIAOMI_API_KEY"],
    base_url="https://api.xiaomimimo.com/v1/"
)

model = OpenAIChatCompletionsModel(
    model="mimo-v2-flash",
    openai_client=client
)

# Urdu Specialist Agent
urdu_agent = Agent(
    name="UrduSpecialist",
    instructions="""You are an Urdu language specialist. Respond EXCLUSIVELY in Urdu.

    Rules:
    - All responses must be in Urdu language
    - Use cultural context and appropriate tone
    - Access MCP tools when users request task operations
    - If user switches to English, politely continue in Urdu
    - Maintain helpful, friendly tone

    Tool Usage:
    - Use MCP tools for task CRUD operations
    - Always provide user_id from context
    - Explain tool results in Urdu
    """,
    model=model
)

# Orchestrator Agent
orchestrator = Agent(
    name="Orchestrator",
    instructions="""You are a task management coordinator. Route requests appropriately.

    Analysis Logic:
    1. Check for Urdu content → Route to UrduSpecialist
    2. Check for task operations → Use MCP tools
    3. General queries → Handle directly

    Routing Rules:
    - Urdu script or language → UrduSpecialist
    - Task CRUD requests → Use MCP tools
    - Questions about tasks → Use MCP tools
    - General conversation → Handle yourself

    Always maintain context about which agent is responding.
    Always provide user_id to MCP tools.
    """,
    handoffs=[urdu_agent],
    model=model
)
```

### Step 1.3: Create Main Entry Point

**File**: `backend/src/backend/main.py` (Update existing)

```python
"""
MCP Agent Integration Main Entry Point
"""
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.database import init_db, close_db
from backend.middleware.auth import get_current_user
from backend.agents import orchestrator, urdu_agent, model, client
from backend.config import settings

# Import existing routers
from backend.routes import tasks, profile

# MCP Server lifecycle management
from agents import MCPServerStdio

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle."""
    await init_db()
    print("✅ Database initialized")
    print("✅ Agent system ready")
    yield
    await close_db()
    print("✅ Database connections closed")

# Create FastAPI app
app = FastAPI(
    title="MCP Agent Backend",
    description="FastAPI backend with AI Agent integration",
    version="0.1.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "mcp-agent-backend",
        "agents": ["Orchestrator", "UrduSpecialist"],
        "version": "0.1.0"
    }

# Agent chat endpoint
@app.post("/api/chat")
async def chat_endpoint(
    request: dict,
    user_id: str = Depends(get_current_user)
):
    """
    Main agent chat endpoint.

    Request: {"message": "user input"}
    Returns: Agent response with tool calls
    """
    message = request.get("message", "")

    if not message or len(message.strip()) == 0:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    if len(message) > 4000:
        raise HTTPException(status_code=400, detail="Message too long")

    # Create MCP server per request
    server = MCPServerStdio(
        params={
            "command": "uv",
            "args": ["run", "task_serves_mcp_tools.py"]
        },
        client_session_timeout_seconds=30
    )

    # Assign to agents
    orchestrator.mcp_servers = [server]
    urdu_agent.mcp_servers = [server]

    try:
        await server.connect()

        # Enhance input with user context
        enhanced_input = f"[User: {user_id}] {message}"

        # Run orchestrator
        result = await Runner.run(
            orchestrator,
            enhanced_input,
            run_config={
                "model": model,
                "model_provider": client,
                "timeout": 30.0
            }
        )

        # Parse result
        response_text = result.output_text
        agent_name = result.last_agent.name if result.last_agent else "Unknown"

        # Extract tool calls if any
        tool_calls = []
        for call in getattr(result, 'tool_calls', []):
            tool_calls.append({
                "tool_name": call.name,
                "arguments": call.arguments,
                "result": call.result,
                "timestamp": call.timestamp.isoformat() if hasattr(call, 'timestamp') else None
            })

        return {
            "success": True,
            "data": {
                "message": response_text,
                "agent": agent_name,
                "timestamp": result.created_at.isoformat(),
                "tool_calls": tool_calls
            }
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "type": type(e).__name__
        }

    finally:
        await server.cleanup()

# Agent health endpoint
@app.get("/api/chat/health")
async def agent_health():
    """Check agent system health."""
    return {
        "status": "healthy",
        "agents": ["Orchestrator", "UrduSpecialist"],
        "mcp_tools": ["create_task", "list_tasks", "update_task", "delete_task", "toggle_task"],
        "timestamp": "2026-01-13T00:00:00Z"
    }

# Include existing routers
app.include_router(tasks.router, prefix="/api/{user_id}", tags=["tasks"])
app.include_router(profile.router, prefix="/api/{user_id}", tags=["profile"])

# Existing main execution
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
```

### Step 1.4: Test Agent Communication

**Test Script**: `backend/scripts/test_agents.py`

```python
#!/usr/bin/env python3
"""
Test agent system without MCP tools
"""
import asyncio
from backend.agents import orchestrator, urdu_agent, model, client
from agents import Runner

async def test_agents():
    # Test 1: Urdu request
    print("=== Test 1: Urdu Language ===")
    result = await Runner.run(orchestrator, "میرا نام کیا ہے؟")
    print(f"Response: {result.output_text}")
    print(f"Agent: {result.last_agent.name}")

    # Test 2: Task request
    print("\n=== Test 2: Task Operation ===")
    result = await Runner.run(orchestrator, "Create a task for tomorrow")
    print(f"Response: {result.output_text}")
    print(f"Agent: {result.last_agent.name}")

    # Test 3: Mixed language
    print("\n=== Test 3: Mixed Language ===")
    result = await Runner.run(orchestrator, "I need to buy groceries, کیا تم میری مدد کر سکتے ہو؟")
    print(f"Response: {result.output_text}")
    print(f"Agent: {result.last_agent.name}")

if __name__ == "__main__":
    asyncio.run(test_agents())
```

**Run Test**:
```bash
cd backend
uv run python scripts/test_agents.py
```

## Phase 2: MCP Integration

### Step 2.1: Create MCP Tools File

**File**: `backend/task_serves_mcp_tools.py`

```python
#!/usr/bin/env python3
"""
MCP Server: Task Management Tools
"""
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent
import json
import asyncio

# Import existing task service
from backend.database import async_session_factory
from backend.models.task import Task, TaskCreate, TaskUpdate
from backend.services.task_service import TaskService
from sqlalchemy.ext.asyncio import AsyncSession

app = Server("task-management-tools")

async def get_task_service() -> TaskService:
    """Get task service with database session."""
    async with async_session_factory() as session:
        yield TaskService(session)

@app.list_tools()
async def list_tools():
    """Return available MCP tools."""
    return [
        Tool(
            name="create_task",
            description="Create a new task for the authenticated user",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {"type": "string", "description": "User ID from JWT"},
                    "title": {"type": "string", "minLength": 1, "maxLength": 200},
                    "description": {"type": "string", "maxLength": 1000},
                    "priority": {"type": "string", "enum": ["low", "medium", "high"], "default": "medium"},
                    "category": {"type": "string", "enum": ["work", "personal", "shopping", "health", "other"], "default": "other"},
                    "due_date": {"type": "string", "format": "date"}
                },
                "required": ["user_id", "title"]
            }
        ),
        Tool(
            name="list_tasks",
            description="Retrieve tasks with optional filtering",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {"type": "string"},
                    "status": {"type": "string", "enum": ["all", "completed", "pending"], "default": "all"},
                    "priority": {"type": "string", "enum": ["low", "medium", "high"]},
                    "category": {"type": "string", "enum": ["work", "personal", "shopping", "health", "other"]},
                    "search": {"type": "string"},
                    "sort_by": {"type": "string", "enum": ["created_at", "due_date", "priority", "title"], "default": "created_at"},
                    "order": {"type": "string", "enum": ["asc", "desc"], "default": "desc"}
                },
                "required": ["user_id"]
            }
        ),
        Tool(
            name="update_task",
            description="Update an existing task",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {"type": "string"},
                    "task_id": {"type": "string", "format": "uuid"},
                    "title": {"type": "string", "minLength": 1, "maxLength": 200},
                    "description": {"type": ["string", "null"], "maxLength": 1000},
                    "completed": {"type": "boolean"},
                    "priority": {"type": "string", "enum": ["low", "medium", "high"]},
                    "category": {"type": "string", "enum": ["work", "personal", "shopping", "health", "other"]},
                    "due_date": {"type": ["string", "null"], "format": "date"}
                },
                "required": ["user_id", "task_id"]
            }
        ),
        Tool(
            name="delete_task",
            description="Delete a task",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {"type": "string"},
                    "task_id": {"type": "string", "format": "uuid"}
                },
                "required": ["user_id", "task_id"]
            }
        ),
        Tool(
            name="toggle_task",
            description="Toggle task completion status",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {"type": "string"},
                    "task_id": {"type": "string", "format": "uuid"}
                },
                "required": ["user_id", "task_id"]
            }
        )
    ]

@app.call_tool()
async def call_tool(name: str, arguments: dict):
    """Execute MCP tool."""
    try:
        service = await get_task_service()

        if name == "create_task":
            result = await service.create(
                user_id=arguments["user_id"],
                title=arguments["title"],
                description=arguments.get("description"),
                priority=arguments.get("priority", "medium"),
                category=arguments.get("category", "other"),
                due_date=arguments.get("due_date")
            )
            return [TextContent(type="text", content=json.dumps({
                "success": True,
                "data": result.to_dict()
            }))]

        elif name == "list_tasks":
            result = await service.list(
                user_id=arguments["user_id"],
                status=arguments.get("status", "all"),
                priority=arguments.get("priority"),
                category=arguments.get("category"),
                search=arguments.get("search"),
                sort_by=arguments.get("sort_by", "created_at"),
                order=arguments.get("order", "desc")
            )
            return [TextContent(type="text", content=json.dumps({
                "success": True,
                "data": result
            }))]

        elif name == "update_task":
            result = await service.update(
                user_id=arguments["user_id"],
                task_id=arguments["task_id"],
                title=arguments.get("title"),
                description=arguments.get("description"),
                completed=arguments.get("completed"),
                priority=arguments.get("priority"),
                category=arguments.get("category"),
                due_date=arguments.get("due_date")
            )
            return [TextContent(type="text", content=json.dumps({
                "success": True,
                "data": result.to_dict()
            }))]

        elif name == "delete_task":
            await service.delete(
                user_id=arguments["user_id"],
                task_id=arguments["task_id"]
            )
            return [TextContent(type="text", content=json.dumps({
                "success": True,
                "data": None
            }))]

        elif name == "toggle_task":
            result = await service.toggle(
                user_id=arguments["user_id"],
                task_id=arguments["task_id"]
            )
            return [TextContent(type="text", content=json.dumps({
                "success": True,
                "data": {
                    "id": str(result.id),
                    "title": result.title,
                    "completed": result.completed,
                    "new_status": "completed" if result.completed else "pending"
                }
            }))]

        else:
            return [TextContent(type="text", content=json.dumps({
                "success": False,
                "error": f"Unknown tool: {name}"
            }))]

    except Exception as e:
        return [TextContent(type="text", content=json.dumps({
            "success": False,
            "error": str(e),
            "type": type(e).__name__
        }))]

async def main():
    """Start MCP server."""
    async with stdio_server() as (read_stream, write_stream):
        await app.run(read_stream, write_stream)

if __name__ == "__main__":
    asyncio.run(main())
```

### Step 2.2: Create Task Service

**File**: `backend/src/backend/services/task_service.py`

```python
"""
Task Service: Business logic for task operations
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from uuid import UUID
from datetime import date, datetime
from typing import Optional, List, Dict, Any

from backend.models.task import Task, TaskCreate, TaskUpdate, TaskListResponse

class TaskService:
    """Service layer for task operations - decoupled from API/MCP layers."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(
        self,
        user_id: str,
        title: str,
        description: Optional[str] = None,
        priority: str = "medium",
        category: str = "other",
        due_date: Optional[date] = None
    ) -> Task:
        """Create a new task."""
        task = Task(
            user_id=user_id,
            title=title,
            description=description,
            priority=priority,
            category=category,
            due_date=due_date
        )
        self.session.add(task)
        await self.session.commit()
        await self.session.refresh(task)
        return task

    async def get(self, user_id: str, task_id: UUID) -> Optional[Task]:
        """Get single task by ID."""
        query = select(Task).where(
            and_(
                Task.id == task_id,
                Task.user_id == user_id
            )
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def list(
        self,
        user_id: str,
        status: str = "all",
        priority: Optional[str] = None,
        category: Optional[str] = None,
        search: Optional[str] = None,
        sort_by: str = "created_at",
        order: str = "desc"
    ) -> Dict[str, Any]:
        """List tasks with filtering and sorting."""
        query = select(Task).where(Task.user_id == user_id)

        # Status filter
        if status == "completed":
            query = query.where(Task.completed == True)
        elif status == "pending":
            query = query.where(Task.completed == False)

        # Priority filter
        if priority:
            query = query.where(Task.priority == priority)

        # Category filter
        if category:
            query = query.where(Task.category == category)

        # Search filter
        if search:
            search_pattern = f"%{search}%"
            query = query.where(
                or_(
                    Task.title.ilike(search_pattern),
                    Task.description.ilike(search_pattern)
                )
            )

        # Sorting
        sort_field = getattr(Task, sort_by, Task.created_at)
        if order == "asc":
            query = query.order_by(sort_field.asc())
        else:
            query = query.order_by(sort_field.desc())

        # Execute query
        result = await self.session.execute(query)
        tasks = result.scalars().all()

        # Calculate stats
        completed_count = sum(1 for t in tasks if t.completed)

        return {
            "tasks": [task.to_dict() for task in tasks],
            "total": len(tasks),
            "completed_count": completed_count,
            "pending_count": len(tasks) - completed_count
        }

    async def update(
        self,
        user_id: str,
        task_id: UUID,
        title: Optional[str] = None,
        description: Optional[str] = None,
        completed: Optional[bool] = None,
        priority: Optional[str] = None,
        category: Optional[str] = None,
        due_date: Optional[date] = None
    ) -> Task:
        """Update existing task."""
        task = await self.get(user_id, task_id)
        if not task:
            raise ValueError("Task not found")

        if title is not None:
            task.title = title
        if description is not None:
            task.description = description
        if completed is not None:
            task.completed = completed
        if priority is not None:
            task.priority = priority
        if category is not None:
            task.category = category
        if due_date is not None:
            task.due_date = due_date

        task.updated_at = datetime.utcnow()
        await self.session.commit()
        await self.session.refresh(task)
        return task

    async def delete(self, user_id: str, task_id: UUID) -> None:
        """Delete a task."""
        task = await self.get(user_id, task_id)
        if not task:
            raise ValueError("Task not found")

        await self.session.delete(task)
        await self.session.commit()

    async def toggle(self, user_id: str, task_id: UUID) -> Task:
        """Toggle task completion status."""
        task = await self.get(user_id, task_id)
        if not task:
            raise ValueError("Task not found")

        task.completed = not task.completed
        task.updated_at = datetime.utcnow()
        await self.session.commit()
        await self.session.refresh(task)
        return task
```

### Step 2.3: Update Environment Configuration

**File**: `backend/.env` (Add to existing)
```bash
# MCP Agent Integration
XIAOMI_API_KEY=your_xiaomi_api_key_here
MCP_SERVER_TIMEOUT=30
```

**File**: `frontend/.env.local` (Add to existing)
```bash
# Agent Chat Endpoint
NEXT_PUBLIC_AGENT_API_URL=http://localhost:8000/api/chat
```

### Step 2.4: Test MCP Integration

**Test Script**: `backend/scripts/test_mcp_integration.py`

```python
#!/usr/bin/env python3
"""
Test MCP integration end-to-end
"""
import asyncio
import json
from backend.agents import orchestrator, model, client
from agents import Runner, MCPServerStdio

async def test_mcp_integration():
    # Create MCP server
    server = MCPServerStdio(
        params={
            "command": "uv",
            "args": ["run", "task_serves_mcp_tools.py"]
        }
    )

    # Assign to agent
    orchestrator.mcp_servers = [server]

    try:
        await server.connect()

        # Test 1: Create task via agent
        print("=== Test 1: Create Task via Agent ===")
        result = await Runner.run(
            orchestrator,
            "[User: test-user-123] Create a task called 'Buy groceries' due tomorrow"
        )
        print(f"Response: {result.output_text}")

        # Test 2: List tasks
        print("\n=== Test 2: List Tasks via Agent ===")
        result = await Runner.run(
            orchestrator,
            "[User: test-user-123] Show me my tasks"
        )
        print(f"Response: {result.output_text}")

    finally:
        await server.cleanup()

if __name__ == "__main__":
    asyncio.run(test_mcp_integration())
```

## Phase 3: Frontend UI

### Step 3.1: Create Chatbot Page

**File**: `frontend/src/app/chatbot/page.tsx`

```typescript
/**
 * Chatbot Page - Agent Interaction Interface
 */
"use client"

import * as React from "react"
import { useSession } from "@/hooks/useAuth"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { getJwtToken } from "@/lib/auth/auth-client"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Loader2, Send, User, Bot } from "lucide-react"
import { toast } from "sonner"

interface ChatMessage {
  id: string
  role: "user" | "agent"
  content: string
  agent?: string
  timestamp: string
  toolCalls?: Array<{
    tool_name: string
    arguments: any
    result: any
  }>
}

interface ChatResponse {
  success: boolean
  data?: {
    message: string
    agent: string
    timestamp: string
    tool_calls: Array<{
      tool_name: string
      arguments: any
      result: any
    }>
  }
  error?: string
}

export default function ChatbotPage() {
  const { session, isLoading: sessionLoading } = useSession()
  const queryClient = useQueryClient()

  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = React.useState("")
  const [isStreaming, setIsStreaming] = React.useState(false)

  const sendMessage = useMutation<ChatResponse, Error, string>({
    mutationFn: async (message: string) => {
      const token = await getJwtToken()
      if (!token) {
        throw new Error("Authentication required")
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to send message")
      }

      return response.json()
    },
    onMutate: (message) => {
      // Add user message immediately
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "user",
        content: message,
        timestamp: new Date().toISOString()
      }])
      setIsStreaming(true)
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: "agent",
          content: data.data.message,
          agent: data.data.agent,
          timestamp: data.data.timestamp,
          toolCalls: data.data.tool_calls
        }])
      } else if (!data.success && data.error) {
        toast.error(data.error)
      }
    },
    onError: (error) => {
      toast.error(error.message)
      // Remove the last user message since agent failed
      setMessages(prev => prev.slice(0, -1))
    },
    onSettled: () => {
      setIsStreaming(false)
      // Scroll to bottom
      setTimeout(() => {
        const container = document.getElementById("chat-container")
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      }, 100)
    }
  })

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedMessage = inputMessage.trim()
    if (!trimmedMessage || sendMessage.isPending) return

    sendMessage.mutate(trimmedMessage)
    setInputMessage("")
  }

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please sign in to access the chatbot.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9F7F2] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-serif font-bold text-[#2A1B12]">
            AI Task Assistant
          </h1>
          <p className="text-[#5C4D45] font-sans">
            Chat with your dual-agent system in English or Urdu
          </p>
        </div>

        {/* Chat Container */}
        <Card className="bg-white border-[#2A1B12]/10">
          <CardContent className="p-0">
            <div
              id="chat-container"
              className="h-[60vh] overflow-y-auto p-6 space-y-4"
            >
              {messages.length === 0 ? (
                <div className="text-center text-[#5C4D45] py-12">
                  <p className="font-mono text-sm">No messages yet</p>
                  <p className="text-sm mt-2">
                    Try: "Create a task for tomorrow" or "میرا نام کیا ہے؟"
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-3 ${
                        msg.role === "user"
                          ? "bg-[#FF6B4A] text-white"
                          : "bg-[#F9F7F2] text-[#2A1B12] border border-[#2A1B12]/10"
                      }`}
                    >
                      {/* Agent Attribution */}
                      {msg.role === "agent" && msg.agent && (
                        <div className="flex items-center gap-2 mb-2 text-xs font-mono opacity-70">
                          <Bot className="h-3 w-3" />
                          <span>{msg.agent}</span>
                        </div>
                      )}

                      {/* Message Content */}
                      <div className="font-sans whitespace-pre-wrap">
                        {msg.content}
                      </div>

                      {/* Tool Calls */}
                      {msg.toolCalls && msg.toolCalls.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {msg.toolCalls.map((call, idx) => (
                            <div
                              key={idx}
                              className="text-xs font-mono bg-white/20 rounded px-2 py-1"
                            >
                              🛠️ {call.tool_name}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Timestamp */}
                      <div className="text-[10px] font-mono opacity-50 mt-2">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Loading Indicator */}
              {isStreaming && (
                <div className="flex justify-start">
                  <div className="bg-[#F9F7F2] border border-[#2A1B12]/10 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm font-mono">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSendMessage}
              className="border-t border-[#2A1B12]/10 p-4"
            >
              <div className="flex gap-3">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message... (English or Urdu)"
                  disabled={sendMessage.isPending}
                  className="flex-1 font-sans"
                  maxLength={4000}
                />
                <Button
                  type="submit"
                  disabled={sendMessage.isPending || !inputMessage.trim()}
                  variant="primary"
                  size="icon"
                >
                  {sendMessage.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="text-xs text-[#5C4D45] mt-2 flex justify-between font-mono">
                <span>{inputMessage.length}/4000 characters</span>
                <span>
                  {sendMessage.isPending ? "Sending..." : "Ready"}
                </span>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            variant="outline"
            onClick={() => setInputMessage("Create a task for tomorrow called Buy groceries")}
            disabled={sendMessage.isPending}
          >
            Quick: Create Task
          </Button>
          <Button
            variant="outline"
            onClick={() => setInputMessage("Show me my pending tasks")}
            disabled={sendMessage.isPending}
          >
            Quick: List Tasks
          </Button>
          <Button
            variant="outline"
            onClick={() => setInputMessage("میرا نام کیا ہے؟")}
            disabled={sendMessage.isPending}
          >
            Quick: Urdu Test
          </Button>
        </div>

        {/* System Info */}
        <div className="text-center text-xs font-mono text-[#5C4D45]">
          <p>Orchestrator + Urdu Specialist | MCP Tools Active | JWT Auth</p>
        </div>
      </div>
    </div>
  )
}
```

### Step 3.2: Update Navigation

**File**: `frontend/src/components/layout/Header.tsx` (Add chatbot link)

```typescript
// Add to navigation items
const navItems = [
  { href: "/tasks", label: "Tasks" },
  { href: "/profile", label: "Profile" },
  { href: "/chatbot", label: "AI Chat" }, // NEW
]
```

### Step 3.3: Create Chat API Route

**File**: `frontend/src/app/api/chat/route.ts`

```typescript
/**
 * Frontend API Route for Agent Chat
 * Proxies requests to backend with authentication
 */
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    // Get JWT token from cookies
    const cookieStore = await cookies()
    const token = cookieStore.get("better-auth.session_token")?.value

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    // Get message from request
    const { message } = await request.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid message" },
        { status: 400 }
      )
    }

    if (message.length > 4000) {
      return NextResponse.json(
        { success: false, error: "Message too long" },
        { status: 400 }
      )
    }

    // Call backend agent endpoint
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const response = await fetch(`${backendUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.error || "Backend error" },
        { status: response.status }
      )
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "frontend-chat-proxy",
    timestamp: new Date().toISOString()
  })
}
```

### Step 3.4: Test Frontend Integration

**Manual Test Steps**:
1. Start backend: `cd backend && uv run uvicorn backend.main:app --reload`
2. Start frontend: `cd frontend && npm run dev`
3. Navigate to `http://localhost:3000/chatbot`
4. Sign in with Better Auth
5. Test messages:
   - "Create a task for tomorrow"
   - "میرا نام کیا ہے؟"
   - "Show me my tasks"

## Environment Setup Checklist

### Backend Environment
- [ ] `XIAOMI_API_KEY` set in backend `.env`
- [ ] Database connection string configured
- [ ] Better Auth secret matches frontend
- [ ] Port 8000 available

### Frontend Environment
- [ ] `NEXT_PUBLIC_API_URL` points to backend
- [ ] Better Auth configured with correct secret
- [ ] Port 3000 available

### Database
- [ ] Neon PostgreSQL running
- [ ] Task table exists (from phase-3)
- [ ] User isolation working

## Common Issues & Solutions

### Issue: "MCP server not found"
**Solution**: Ensure `task_serves_mcp_tools.py` is in backend root and executable

### Issue: "Xiaomi API key invalid"
**Solution**: Check `XIAOMI_API_KEY` environment variable and Xiaomi account

### Issue: "User isolation not working"
**Solution**: Verify JWT validation and user_id extraction in middleware

### Issue: "Frontend can't connect to backend"
**Solution**: Check CORS origins and `NEXT_PUBLIC_API_URL`

## Success Verification

### Phase 1 Complete When:
- [ ] `agents.py` created with both agents
- [ ] `main.py` starts with `/api/chat` endpoint
- [ ] Urdu agent responds in Urdu
- [ ] Orchestrator routes correctly

### Phase 2 Complete When:
- [ ] `task_serves_mcp_tools.py` runs as MCP server
- [ ] All 5 CRUD tools work via MCP
- [ ] User isolation enforced
- [ ] Agent can call tools successfully

### Phase 3 Complete When:
- [ ] `/chatbot` page loads in browser
- [ ] User can send messages
- [ ] Agent responses display correctly
- [ ] Tool calls show in UI
- [ ] Urdu language works

## Next Steps

After completing this quickstart:
1. **Run full integration tests**
2. **Add error handling improvements**
3. **Implement streaming responses (optional)**
4. **Add conversation history (Phase 4)**
5. **Deploy to production**

## Support

For issues or questions:
- Check `research.md` for architectural decisions
- Review `data-model.md` for entity relationships
- See `contracts/` for API specifications
- Review existing phase-3 code for patterns