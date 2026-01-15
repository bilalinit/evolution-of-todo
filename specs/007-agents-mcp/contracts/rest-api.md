# API Contracts: MCP Agent Integration

**Date**: 2026-01-13
**Branch**: 007-agents-mcp
**Feature**: Phase 3 MCP Agent Integration Specification

## Overview

This document defines the REST API contracts for the MCP Agent Integration system. All endpoints are authenticated using JWT tokens from Better Auth and follow the existing phase-3 API patterns.

## Base URL
```
http://localhost:8000  (Development)
https://api.yourdomain.com  (Production)
```

## Authentication

### JWT Token Flow
1. **Frontend**: Better Auth manages session automatically
2. **Token Extraction**: Use `authClient.token()` to get JWT
3. **API Calls**: Include in `Authorization: Bearer <token>` header
4. **Backend**: JWT validation via JWKS, user_id extraction

### Authentication Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Agent Endpoints

### 1. Chat with Agent System

**Endpoint**: `POST /api/chat`

**Purpose**: Send message to agent system and receive response

**Request**:
```json
{
  "message": "string (required, max 4000 chars)"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Agent response text",
    "agent": "Orchestrator",
    "timestamp": "2026-01-13T10:30:00Z",
    "tool_calls": [
      {
        "tool_name": "create_task",
        "arguments": {"title": "Buy groceries", "user_id": "user_123"},
        "result": {"success": true, "data": {"id": "uuid", "title": "Buy groceries"}},
        "timestamp": "2026-01-13T10:30:01Z"
      }
    ]
  }
}
```

**Error Response** (4xx/5xx):
```json
{
  "success": false,
  "error": "Error description",
  "type": "ValidationError|AuthError|AgentError"
}
```

**Status Codes**:
- `200`: Success
- `400`: Invalid request (message too long, missing fields)
- `401`: Invalid or missing JWT token
- `422`: Agent processing error
- `500`: Internal server error

**Example Usage**:
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Create a task for tomorrow called Buy groceries"}'
```

---

### 2. Health Check for Agent System

**Endpoint**: `GET /api/chat/health`

**Purpose**: Verify agent system is operational

**Response** (200 OK):
```json
{
  "status": "healthy",
  "agents": ["Orchestrator", "UrduSpecialist"],
  "mcp_tools": ["create_task", "list_tasks", "update_task", "delete_task", "toggle_task"],
  "timestamp": "2026-01-13T10:30:00Z"
}
```

**Status Codes**:
- `200`: System healthy
- `503`: System unavailable (MCP server issues)

---

## MCP Tool Endpoints (Direct Access)

These endpoints provide direct access to MCP tools for testing and fallback scenarios.

### 3. Create Task via MCP Tool

**Endpoint**: `POST /api/{user_id}/mcp/create_task`

**Purpose**: Direct MCP tool access for task creation

**Request**:
```json
{
  "title": "string (required, 1-200 chars)",
  "description": "string (optional, max 1000 chars)",
  "priority": "enum(low|medium|high) (default: medium)",
  "category": "enum(work|personal|shopping|health|other) (default: other)",
  "due_date": "string (optional, ISO date format)"
}
```

**Success Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "title": "Buy groceries",
    "description": null,
    "completed": false,
    "priority": "medium",
    "category": "other",
    "due_date": "2026-01-14",
    "user_id": "user_123",
    "created_at": "2026-01-13T10:30:00Z",
    "updated_at": "2026-01-13T10:30:00Z"
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "error": "Task title cannot be empty",
  "type": "ValidationError"
}
```

**Status Codes**:
- `201`: Task created successfully
- `400`: Validation error
- `401`: Authentication required
- `403`: User ID mismatch (path user_id ≠ JWT user_id)

---

### 4. List Tasks via MCP Tool

**Endpoint**: `GET /api/{user_id}/mcp/list_tasks`

**Purpose**: Direct MCP tool access for task listing

**Query Parameters**:
- `status`: Filter by status (all|completed|pending)
- `priority`: Filter by priority (low|medium|high)
- `category`: Filter by category (work|personal|shopping|health|other)
- `search`: Search in title and description
- `sort_by`: Sort field (created_at|due_date|priority|title)
- `order`: Sort order (asc|desc)

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "uuid-string",
        "title": "Buy groceries",
        "description": null,
        "completed": false,
        "priority": "medium",
        "category": "other",
        "due_date": "2026-01-14",
        "user_id": "user_123",
        "created_at": "2026-01-13T10:30:00Z",
        "updated_at": "2026-01-13T10:30:00Z"
      }
    ],
    "total": 1,
    "completed_count": 0,
    "pending_count": 1
  }
}
```

**Example Usage**:
```bash
curl "http://localhost:8000/api/user_123/mcp/list_tasks?status=pending&priority=medium&sort_by=created_at&order=desc" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

---

### 5. Update Task via MCP Tool

**Endpoint**: `PUT /api/{user_id}/mcp/update_task/{task_id}`

**Purpose**: Direct MCP tool access for task updates

**Request**:
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "completed": "boolean (optional)",
  "priority": "enum(low|medium|high) (optional)",
  "category": "enum(work|personal|shopping|health|other) (optional)",
  "due_date": "string (optional, ISO date format)"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "title": "Buy groceries and essentials",
    "description": "Important shopping trip",
    "completed": false,
    "priority": "high",
    "category": "personal",
    "due_date": "2026-01-14",
    "user_id": "user_123",
    "created_at": "2026-01-13T10:30:00Z",
    "updated_at": "2026-01-13T10:35:00Z"
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "error": "Task not found",
  "type": "NotFoundError"
}
```

---

### 6. Delete Task via MCP Tool

**Endpoint**: `DELETE /api/{user_id}/mcp/delete_task/{task_id}`

**Purpose**: Direct MCP tool access for task deletion

**Success Response** (204 No Content):
```json
{
  "success": true,
  "data": null
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "error": "Task not found",
  "type": "NotFoundError"
}
```

---

### 7. Toggle Task Completion via MCP Tool

**Endpoint**: `PATCH /api/{user_id}/mcp/toggle_task/{task_id}`

**Purpose**: Direct MCP tool access for toggling task completion

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "title": "Buy groceries",
    "completed": true,
    "new_status": "completed"
  }
}
```

---

## Existing Task Endpoints (Unchanged)

The following existing endpoints remain available and are used by MCP tools internally:

- `GET /api/{user_id}/tasks` - List tasks with filters
- `GET /api/{user_id}/tasks/{task_id}` - Get single task
- `POST /api/{user_id}/tasks` - Create task
- `PUT /api/{user_id}/tasks/{task_id}` - Update task
- `PATCH /api/{user_id}/tasks/{task_id}/complete` - Toggle completion
- `DELETE /api/{user_id}/tasks/{task_id}` - Delete task
- `GET /api/{user_id}/profile` - User profile and stats

## Error Response Standard

All endpoints follow this error format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "type": "ErrorType",
  "details": {
    "field": "Specific validation error",
    "code": "ERROR_CODE"
  }
}
```

### Error Types
- `ValidationError`: Input validation failed
- `AuthError`: Authentication/authorization failed
- `NotFoundError`: Resource not found
- `AgentError`: Agent processing failed
- `MCPError`: MCP tool execution failed
- `InternalError`: Server error

## Rate Limiting

**Recommended Limits**:
- **Chat Endpoint**: 10 requests per minute per user
- **MCP Tools**: 30 requests per minute per user
- **Health Check**: No limit

**Headers**:
```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1642065000
```

## Pagination

For list endpoints, use cursor-based pagination:

**Request**:
```json
{
  "limit": 20,
  "cursor": "uuid-of-last-item"
}
```

**Response**:
```json
{
  "data": [...],
  "pagination": {
    "has_more": true,
    "next_cursor": "uuid-of-next-item",
    "total_count": 150
  }
}
```

## Versioning

**Current Version**: `v1`

**Strategy**: URL-based versioning
```
/api/v1/chat
/api/v1/{user_id}/mcp/create_task
```

**Deprecation Policy**: 6-month notice for breaking changes

## CORS Configuration

**Allowed Origins**:
- `http://localhost:3000` (Development)
- `https://yourdomain.com` (Production)

**Allowed Methods**: GET, POST, PUT, PATCH, DELETE
**Allowed Headers**: Authorization, Content-Type, Accept
**Credentials**: true

## WebSocket Support (Future)

For real-time agent responses, consider WebSocket upgrade:

**Endpoint**: `GET /api/v1/chat/ws`

**Protocol**: JSON messages over WebSocket
- Client sends: `{"message": "user input"}`
- Server sends: `{"type": "stream", "content": "partial response"}`
- Server sends: `{"type": "complete", "data": {...}}`

## Testing Examples

### Example 1: Urdu Language Request
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "میرا نام کیا ہے؟"}'
```

### Example 2: Task Creation via Agent
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Create a high priority task for tomorrow called Prepare presentation"}'
```

### Example 3: Direct MCP Tool Call
```bash
curl -X POST http://localhost:8000/api/user_123/mcp/create_task \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test task", "priority": "high", "category": "work"}'
```

## Integration with Frontend

### Using React Query
```typescript
import { useMutation } from '@tanstack/react-query'

const useAgentChat = () => {
  return useMutation({
    mutationFn: async (message: string) => {
      const token = await getJwtToken()
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      })
      return response.json()
    }
  })
}
```

### Using API Client
```typescript
import apiClient from '@/lib/api/client'

const chatWithAgent = async (message: string) => {
  return await apiClient.post('/api/chat', { message })
}
```

This API contract ensures compatibility with existing phase-3 infrastructure while providing the agent integration capabilities needed for Phase 3 implementation.