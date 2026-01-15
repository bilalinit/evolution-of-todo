# Data Model: MCP Agent Integration

**Date**: 2026-01-13
**Branch**: 007-agents-mcp
**Feature**: Phase 3 MCP Agent Integration Specification

## Overview

This data model extends the existing phase-3 task management system to support AI agent interactions. It maintains compatibility with current database schema while adding support for agent-specific operations.

## Core Entities

### 1. Task Entity (Existing - Extended)

**SQLModel Definition**:
```python
class Task(SQLModel, table=True):
    """Task entity - represents a single todo item owned by a user."""

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)
    priority: Priority = Field(default=Priority.MEDIUM, sa_column_kwargs={"nullable": False})
    category: Category = Field(default=Category.OTHER, sa_column_kwargs={"nullable": False})
    due_date: Optional[date] = Field(default=None)
    user_id: str = Field(index=True)  # References Better Auth user.id
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

**Agent Context Extension**:
- **No schema changes required** - existing entity supports agent operations
- **User isolation**: All agent queries include `user_id` filter
- **Validation**: Agents must provide valid priority/category enums

### 2. Chat Session (New - Optional for Future)

**Purpose**: Track agent conversations for debugging and analytics

```python
class ChatSession(SQLModel, table=True):
    """Agent conversation session for audit and debugging."""

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: str = Field(index=True)
    started_at: datetime = Field(default_factory=datetime.utcnow)
    ended_at: Optional[datetime] = Field(default=None)
    agent_name: str = Field(max_length=100)  # "Orchestrator" or "UrduSpecialist"
    message_count: int = Field(default=0)
    status: str = Field(default="active")  # active, completed, error

class ChatMessage(SQLModel, table=True):
    """Individual messages within a session."""

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    session_id: UUID = Field(foreign_key="chatsession.id", index=True)
    role: str = Field()  # "user" or "agent"
    content: str = Field(max_length=4000)
    agent_name: Optional[str] = Field(default=None)  # Which agent responded
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    tool_calls: Optional[str] = Field(default=None)  # JSON of MCP tool calls
```

**Note**: This entity is marked **optional** for Phase 3 implementation. It can be added in Phase 4 for enhanced observability.

### 3. User Context (Virtual - Runtime Only)

**Purpose**: User authentication context for agent operations

```python
class UserContext:
    """Runtime user context for agent operations."""

    user_id: str  # From JWT token
    token: str    # JWT token for MCP server authentication
    email: str    # From Better Auth session
    name: str     # Optional user name
```

**Implementation**: This is not persisted to database, but passed through the request lifecycle.

## Agent-Specific Data Structures

### 4. Agent Response Model

```python
class AgentResponse(BaseModel):
    """Structured response from agent system."""

    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    agent_name: str  # "Orchestrator" or "UrduSpecialist"
    tool_calls: List[ToolCall] = []
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ToolCall(BaseModel):
    """MCP tool execution record."""

    tool_name: str
    arguments: Dict[str, Any]
    result: Dict[str, Any]
    timestamp: datetime
```

### 5. Chat Request/Response Models

```python
class ChatRequest(BaseModel):
    """Request to agent system."""

    message: str
    # User context extracted from JWT automatically

class ChatResponse(BaseModel):
    """Response from agent system."""

    message: str
    agent: str  # Which agent responded
    timestamp: datetime
    # Additional metadata for debugging
```

## Relationships

### Entity Relationships
```
User (Better Auth) 1:* Task
User (Better Auth) 1:* ChatSession (optional)
ChatSession 1:* ChatMessage (optional)
```

### Agent Data Flow
```
User Request → JWT Validation → User Context → Agent System → MCP Tools → Task Operations
     ↓              ↓              ↓              ↓            ↓          ↓
  Frontend     Auth Middleware  User ID     Orchestrator  CRUD     Database
```

## Validation Rules

### Task Operations via Agents
1. **Title**: 1-200 characters, required
2. **Description**: Optional, max 1000 characters
3. **Priority**: Must be "low", "medium", or "high"
4. **Category**: Must be "work", "personal", "shopping", "health", or "other"
5. **Due Date**: Optional date in ISO format
6. **User Isolation**: All operations scoped to user_id from JWT

### Agent Communication
1. **Message Length**: Max 4000 characters for agent input
2. **Response Format**: Always structured with {success, data/error}
3. **Language**: Urdu agent responds exclusively in Urdu
4. **Routing**: Orchestrator determines appropriate agent

## State Transitions

### Task Lifecycle (Unchanged)
```
Created (pending) → Updated → Completed (true/false) → Deleted
```

### Agent Session Lifecycle (Optional)
```
Session Started → Message Exchange → Session Ended
```

## Database Schema Extensions

### Required Tables
- **Task**: Already exists, no changes needed
- **ChatSession**: Optional, for Phase 4
- **ChatMessage**: Optional, for Phase 4

### Indexes Required
- **Task.user_id**: Already exists
- **ChatSession.user_id**: For user-specific session queries
- **ChatMessage.session_id**: For session message retrieval

## MCP Tool Data Contracts

### Tool: create_task
```json
{
  "input": {
    "user_id": "string (required)",
    "title": "string (1-200 chars)",
    "description": "string (optional, max 1000)",
    "priority": "enum(low|medium|high)",
    "category": "enum(work|personal|shopping|health|other)",
    "due_date": "date (optional)"
  },
  "output": {
    "success": "boolean",
    "data": "Task object",
    "error": "string"
  }
}
```

### Tool: list_tasks
```json
{
  "input": {
    "user_id": "string (required)",
    "status": "enum(all|completed|pending) (optional)",
    "priority": "enum(low|medium|high) (optional)",
    "category": "enum(work|personal|shopping|health|other) (optional)",
    "search": "string (optional)"
  },
  "output": {
    "success": "boolean",
    "data": {
      "tasks": "array of Task objects",
      "total": "integer",
      "completed_count": "integer",
      "pending_count": "integer"
    },
    "error": "string"
  }
}
```

### Tool: update_task
```json
{
  "input": {
    "user_id": "string (required)",
    "task_id": "UUID (required)",
    "title": "string (optional)",
    "description": "string (optional)",
    "completed": "boolean (optional)",
    "priority": "enum(low|medium|high) (optional)",
    "category": "enum(work|personal|shopping|health|other) (optional)",
    "due_date": "date (optional)"
  },
  "output": {
    "success": "boolean",
    "data": "Updated Task object",
    "error": "string"
  }
}
```

### Tool: delete_task
```json
{
  "input": {
    "user_id": "string (required)",
    "task_id": "UUID (required)"
  },
  "output": {
    "success": "boolean",
    "data": null,
    "error": "string"
  }
}
```

### Tool: toggle_task
```json
{
  "input": {
    "user_id": "string (required)",
    "task_id": "UUID (required)"
  },
  "output": {
    "success": "boolean",
    "data": {
      "id": "UUID",
      "title": "string",
      "completed": "boolean",
      "new_status": "string"
    },
    "error": "string"
  }
}
```

## Security Considerations

### Data Isolation
- **Application Level**: All queries include `user_id` filter
- **Tool Level**: User ID required as parameter
- **Session Level**: JWT validation on every request

### Input Validation
- **Pydantic Models**: All inputs validated at API boundary
- **SQLModel**: Database constraints provide additional safety
- **Agent Level**: Tools validate before database operations

### Error Information
- **User-Facing**: Generic error messages
- **Logging**: Detailed errors for debugging (never exposed to users)
- **Agent Context**: Structured errors for agent learning

## Migration Strategy

### Phase 3 Implementation
1. **No Schema Changes**: Use existing Task table
2. **New Tables**: Optional ChatSession/ChatMessage (can be added later)
3. **MCP Tools**: New file, no database migrations needed
4. **Agent Integration**: New code, existing data model

### Phase 4 Extensions
1. **Add ChatSession table**: For conversation history
2. **Add ChatMessage table**: For detailed audit trail
3. **Add analytics fields**: Response times, success rates

## Performance Considerations

### Query Optimization
- **Existing Indexes**: `user_id` on Task table
- **Additional Indexes**: Consider `created_at` for session queries
- **Connection Pooling**: Already configured in backend

### Agent Response Size
- **Task Lists**: Limit to 50 tasks per response
- **Message Content**: Max 4000 characters
- **Tool Results**: Structured, minimal data transfer

## Compliance with Constitution

### ✅ Universal Logic Decoupling
- **Task Service**: Separate from agent/MCP layer
- **Data Models**: Independent of presentation

### ✅ AI-Native Interoperability
- **MCP Tools**: Strictly typed, stateless
- **Natural Language**: Clear schemas for agent understanding

### ✅ Strict Statelessness
- **No Session State**: All state in database
- **Per-Request Servers**: No persistent connections

### ✅ Zero-Trust Multi-Tenancy
- **User Isolation**: Every query includes user_id
- **JWT Validation**: Every request authenticated

## Summary

This data model leverages the existing phase-3 infrastructure while adding support for AI agent operations. **No database schema changes are required** for Phase 3 implementation, making it a low-risk extension that maintains full backward compatibility.

The optional ChatSession/ChatMessage entities are designed for Phase 4 observability enhancements and can be implemented without disrupting core functionality.