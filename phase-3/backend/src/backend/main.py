"""
FastAPI application entry point.
Configures CORS, includes routers, and sets up startup/shutdown events.
"""
# Load environment variables FIRST, before any other imports that might use config
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Depends, HTTPException, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from contextlib import asynccontextmanager
import json

from backend.database import init_db, close_db
from backend.routes import tasks, profile
from backend.exceptions import validation_exception_handler, http_exception_handler
from pydantic import ValidationError
from backend.middleware.auth import get_current_user
from backend.agents import orchestrator as base_orchestrator, urdu_agent as base_urdu_agent, model, client
from agents import Runner, RunConfig, Agent
from agents.mcp import MCPServerStdio
from dotenv import load_dotenv
import openai
import os
import uuid
from datetime import datetime, timezone
from backend.models.chatkit import SessionMetadata, SessionCreateResponse
from backend.chatkit_store import PostgresChatKitStore
from backend.chatkit_server import TodoChatKitServer
load_dotenv()

# Initialize OpenAI client for ChatKit sessions
openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
openai_async_client = openai.AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Global ChatKit store and server instances
chatkit_store = None
chatkit_server = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    """
    # Startup
    await init_db()
    print("✅ Database initialized")
    print("✅ Agent system ready")
    print("✅ MCP tools configured")

    # Initialize ChatKit store and server
    global chatkit_store, chatkit_server
    from backend.database import async_session_factory
    chatkit_store = PostgresChatKitStore(async_session_factory)
    chatkit_server = TodoChatKitServer(chatkit_store)  # Uses Xiaomi client from agents.py
    print("✅ ChatKit store and server initialized")

    yield

    # Shutdown
    await close_db()
    print("✅ Database connections closed")


# Create FastAPI application
app = FastAPI(
    title="Todo Backend API",
    description="FastAPI backend for Todo application with Better Auth integration",
    version="0.1.0",
    lifespan=lifespan
)

# Configure CORS
from backend.config import settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring.
    """
    return {
        "status": "healthy",
        "service": "todo-backend",
        "version": "0.1.0"
    }


@app.get("/")
async def root():
    """
    Root endpoint with API information.
    """
    return {
        "message": "Todo Backend API",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/health"
    }


# Include routers
app.include_router(tasks.router, prefix="/api/{user_id}", tags=["tasks"])
app.include_router(profile.router, prefix="/api/{user_id}", tags=["profile"])

# Agent Endpoints
@app.get("/api/chat/health")
async def agent_health():
    """Check agent system health."""
    return {
        "status": "healthy",
        "agents": ["Orchestrator", "UrduSpecialist"],
        "mcp_tools": ["create_task", "list_tasks", "update_task", "delete_task", "toggle_task"],
        "timestamp": "2026-01-13T00:00:00Z"
    }

@app.post("/api/chat")
async def chat_endpoint(
    request: dict = Body(...),
    user_id: str = Depends(get_current_user)
):
    """
    Main agent chat endpoint.

    Request: {"message": "user input"}
    Returns: Agent response with tool calls

    Supports:
    - Urdu language responses
    - Task operations via MCP tools
    - Dual-agent routing
    """
    message = request.get("message", "")

    if not message or len(message.strip()) == 0:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    if len(message) > 4000:
        raise HTTPException(status_code=400, detail="Message too long")

    # Create new agent instances per request to avoid conflicts
    urdu_agent = Agent(
        name=base_urdu_agent.name,
        instructions=base_urdu_agent.instructions,
        model=model
    )

    orchestrator = Agent(
        name=base_orchestrator.name,
        instructions=base_orchestrator.instructions,
        handoffs=[urdu_agent],
        model=model
    )

    # Enhance input with user context for isolation
    enhanced_input = f"[User: {user_id}] {message}"

    # Run orchestrator with timeout
    config = RunConfig(
        model=model,
        model_provider=client,
    )

    # Create MCP server for this request
    server = MCPServerStdio(
        params={
            "command": "uv",
            "args": ["run", "task_serves_mcp_tools.py"]
        },
        client_session_timeout_seconds=60
    )

    # Attach MCP servers to BOTH agents
    orchestrator.mcp_servers = [server]
    urdu_agent.mcp_servers = [server]  # Give Urdu agent MCP access too

    try:
        # Connect to MCP server
        await server.connect()

        # Run with MCP tools enabled
        result = await Runner.run(
            orchestrator,
            enhanced_input,
            run_config=config
        )

        # Parse result
        response_text = result.final_output
        agent_name = result.last_agent.name if result.last_agent else "Unknown"

        # Extract tool calls if any
        tool_calls = []
        for call in getattr(result, 'used_tools', []):
            tool_calls.append({
                "tool_name": call.name,
                "arguments": getattr(call, 'arguments', {}),
                "result": getattr(call, 'result', {}),
                "timestamp": getattr(call, 'timestamp', None)
            })

        # Handle timestamp safely
        timestamp = None
        if hasattr(result, 'created_at') and result.created_at:
            try:
                timestamp = result.created_at.isoformat()
            except:
                timestamp = None

        return {
            "success": True,
            "data": {
                "message": response_text,
                "agent": agent_name,
                "timestamp": timestamp,
                "tool_calls": tool_calls
            }
        }

    except Exception as e:
        # Log the error for debugging
        print(f"Agent execution error: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "error": f"Agent execution failed: {str(e)}",
            "type": type(e).__name__
        }
    finally:
        # Always cleanup MCP server from both agents
        try:
            await server.cleanup()
            # Clean up the dynamic instances created for this request
            orchestrator.mcp_servers = []
            urdu_agent.mcp_servers = []
        except:
            pass


# ==================== ChatKit Endpoint ====================
# Using ChatKitServer.process() pattern from chatkit-2 skill
# This single endpoint handles ALL ChatKit operations

@app.post("/api/chatkit")
async def chatkit_endpoint(
    request: Request,
    user_id: str = Depends(get_current_user)
):
    """
    Main ChatKit endpoint - handles ALL ChatKit operations.
    
    Uses ChatKitServer.process() which handles:
    - threads.create, threads.get, threads.list
    - messages.create, messages.list  
    - runs.create (with streaming response)
    - All other ChatKit protocol operations
    """
    from chatkit.server import StreamingResult
    from fastapi.responses import StreamingResponse, Response
    
    try:
        print(f"🔍 ChatKit endpoint called for user: {user_id}")
        
        # Create context for user isolation
        context = {
            "user_id": user_id,
            "metadata": {
                "userInfo": {
                    "id": user_id,
                    "name": user_id
                }
            }
        }
        
        # Get raw request body
        body = await request.body()
        print(f"🔍 ChatKit request body length: {len(body)} bytes")
        
        # Process through ChatKit server - handles all protocol operations
        result = await chatkit_server.process(body, context)
        
        # Handle streaming vs JSON responses
        if isinstance(result, StreamingResult):
            print(f"🔍 ChatKit returning streaming response")
            return StreamingResponse(
                result,
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "X-Accel-Buffering": "no"
                }
            )
        else:
            print(f"🔍 ChatKit returning JSON response")
            return Response(
                content=result.json,
                media_type="application/json"
            )
            
    except Exception as e:
        print(f"❌ ChatKit endpoint error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail={
                "code": "INTERNAL_ERROR", 
                "message": f"ChatKit processing error: {str(e)}"
            }
        )

# Add exception handlers
app.add_exception_handler(ValidationError, validation_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)


if __name__ == "__main__":
    import uvicorn
    from backend.config import settings

    uvicorn.run(
        "backend.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )