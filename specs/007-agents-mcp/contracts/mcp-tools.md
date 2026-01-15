# MCP Tools Specification: Agent Integration

**Date**: 2026-01-13
**Branch**: 007-agents-mcp
**Feature**: Phase 3 MCP Agent Integration Specification

## Overview

This document defines the Model Context Protocol (MCP) tools that will be exposed to the AI agent system. These tools provide secure, user-isolated access to task management operations and follow the strict patterns defined in the project constitution.

## Tool Design Principles

### ✅ Universal Logic Decoupling
All tools delegate to the existing `TaskService` layer, ensuring business logic remains independent of the agent interface.

### ✅ AI-Native Interoperability
Tools are stateless, strictly typed, and designed for natural language consumption by AI agents.

### ✅ Zero-Trust Multi-Tenancy
Every tool requires `user_id` parameter and enforces user isolation at the application layer.

### ✅ Strict Statelessness
No session state maintained. Each tool call operates independently.

## Tool Definitions

### 1. create_task

**Purpose**: Create a new task for the authenticated user

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "User ID from JWT token (auto-provided by MCP framework)"
    },
    "title": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200,
      "description": "Task title"
    },
    "description": {
      "type": "string",
      "maxLength": 1000,
      "description": "Optional task description"
    },
    "priority": {
      "type": "string",
      "enum": ["low", "medium", "high"],
      "description": "Task priority level",
      "default": "medium"
    },
    "category": {
      "type": "string",
      "enum": ["work", "personal", "shopping", "health", "other"],
      "description": "Task category",
      "default": "other"
    },
    "due_date": {
      "type": "string",
      "format": "date",
      "description": "Optional due date in ISO format (YYYY-MM-DD)"
    }
  },
  "required": ["user_id", "title"]
}
```

**Output Schema**:
```json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean",
      "description": "Operation success status"
    },
    "data": {
      "type": "object",
      "description": "Created task object",
      "properties": {
        "id": {"type": "string", "format": "uuid"},
        "title": {"type": "string"},
        "description": {"type": ["string", "null"]},
        "completed": {"type": "boolean"},
        "priority": {"type": "string", "enum": ["low", "medium", "high"]},
        "category": {"type": "string", "enum": ["work", "personal", "shopping", "health", "other"]},
        "due_date": {"type": ["string", "null"], "format": "date"},
        "user_id": {"type": "string"},
        "created_at": {"type": "string", "format": "date-time"},
        "updated_at": {"type": "string", "format": "date-time"}
      }
    },
    "error": {
      "type": ["string", "null"],
      "description": "Error message if operation failed"
    }
  }
}
```

**Error Cases**:
- Empty title → `{"success": false, "error": "Task title cannot be empty"}`
- Title too long → `{"success": false, "error": "Title exceeds 200 characters"}`
- Invalid priority → `{"success": false, "error": "Invalid priority value"}`
- Invalid category → `{"success": false, "error": "Invalid category value"}`
- Invalid date format → `{"success": false, "error": "Invalid date format"}`

**Agent Usage Examples**:
```
User: "Create a task for tomorrow called Buy groceries"
Agent: Calls create_task with title="Buy groceries", due_date="2026-01-14"

User: "Add a high priority task for work: Prepare quarterly report"
Agent: Calls create_task with title="Prepare quarterly report", priority="high", category="work"
```

---

### 2. list_tasks

**Purpose**: Retrieve tasks for the authenticated user with optional filtering

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "User ID from JWT token"
    },
    "status": {
      "type": "string",
      "enum": ["all", "completed", "pending"],
      "description": "Filter by completion status",
      "default": "all"
    },
    "priority": {
      "type": "string",
      "enum": ["low", "medium", "high"],
      "description": "Filter by priority"
    },
    "category": {
      "type": "string",
      "enum": ["work", "personal", "shopping", "health", "other"],
      "description": "Filter by category"
    },
    "search": {
      "type": "string",
      "description": "Search in title and description"
    },
    "sort_by": {
      "type": "string",
      "enum": ["created_at", "due_date", "priority", "title"],
      "description": "Sort field",
      "default": "created_at"
    },
    "order": {
      "type": "string",
      "enum": ["asc", "desc"],
      "description": "Sort order",
      "default": "desc"
    }
  },
  "required": ["user_id"]
}
```

**Output Schema**:
```json
{
  "type": "object",
  "properties": {
    "success": {"type": "boolean"},
    "data": {
      "type": "object",
      "properties": {
        "tasks": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": {"type": "string", "format": "uuid"},
              "title": {"type": "string"},
              "description": {"type": ["string", "null"]},
              "completed": {"type": "boolean"},
              "priority": {"type": "string", "enum": ["low", "medium", "high"]},
              "category": {"type": "string", "enum": ["work", "personal", "shopping", "health", "other"]},
              "due_date": {"type": ["string", "null"], "format": "date"},
              "user_id": {"type": "string"},
              "created_at": {"type": "string", "format": "date-time"},
              "updated_at": {"type": "string", "format": "date-time"}
            }
          }
        },
        "total": {"type": "integer"},
        "completed_count": {"type": "integer"},
        "pending_count": {"type": "integer"}
      }
    },
    "error": {"type": ["string", "null"]}
  }
}
```

**Agent Usage Examples**:
```
User: "Show me all my tasks"
Agent: Calls list_tasks with user_id

User: "What pending tasks do I have?"
Agent: Calls list_tasks with status="pending"

User: "Show me work tasks due this week"
Agent: Calls list_tasks with category="work" (then filters by date client-side)

User: "Find tasks about reports"
Agent: Calls list_tasks with search="reports"
```

---

### 3. update_task

**Purpose**: Update an existing task

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "User ID from JWT token"
    },
    "task_id": {
      "type": "string",
      "format": "uuid",
      "description": "ID of task to update"
    },
    "title": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200,
      "description": "New title (optional)"
    },
    "description": {
      "type": ["string", "null"],
      "maxLength": 1000,
      "description": "New description (optional, null to clear)"
    },
    "completed": {
      "type": "boolean",
      "description": "Completion status (optional)"
    },
    "priority": {
      "type": "string",
      "enum": ["low", "medium", "high"],
      "description": "New priority (optional)"
    },
    "category": {
      "type": "string",
      "enum": ["work", "personal", "shopping", "health", "other"],
      "description": "New category (optional)"
    },
    "due_date": {
      "type": ["string", "null"],
      "format": "date",
      "description": "New due date (optional, null to clear)"
    }
  },
  "required": ["user_id", "task_id"]
}
```

**Output Schema**:
```json
{
  "type": "object",
  "properties": {
    "success": {"type": "boolean"},
    "data": {
      "type": "object",
      "properties": {
        "id": {"type": "string", "format": "uuid"},
        "title": {"type": "string"},
        "description": {"type": ["string", "null"]},
        "completed": {"type": "boolean"},
        "priority": {"type": "string", "enum": ["low", "medium", "high"]},
        "category": {"type": "string", "enum": ["work", "personal", "shopping", "health", "other"]},
        "due_date": {"type": ["string", "null"], "format": "date"},
        "user_id": {"type": "string"},
        "created_at": {"type": "string", "format": "date-time"},
        "updated_at": {"type": "string", "format": "date-time"}
      }
    },
    "error": {"type": ["string", "null"]}
  }
}
```

**Error Cases**:
- Task not found → `{"success": false, "error": "Task not found"}`
- Task belongs to different user → `{"success": false, "error": "Access denied"}`
- Empty title → `{"success": false, "error": "Task title cannot be empty"}`

**Agent Usage Examples**:
```
User: "Rename task 'Buy groceries' to 'Buy groceries and essentials'"
Agent: Calls list_tasks to find task, then update_task with new title

User: "Mark my presentation task as complete"
Agent: Calls list_tasks with search="presentation", then update_task with completed=true

User: "Change task priority to high"
Agent: Calls update_task with priority="high"
```

---

### 4. delete_task

**Purpose**: Delete a task

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "User ID from JWT token"
    },
    "task_id": {
      "type": "string",
      "format": "uuid",
      "description": "ID of task to delete"
    }
  },
  "required": ["user_id", "task_id"]
}
```

**Output Schema**:
```json
{
  "type": "object",
  "properties": {
    "success": {"type": "boolean"},
    "data": {"type": "null"},
    "error": {"type": ["string", "null"]}
  }
}
```

**Error Cases**:
- Task not found → `{"success": false, "error": "Task not found"}`
- Task belongs to different user → `{"success": false, "error": "Access denied"}`

**Agent Usage Examples**:
```
User: "Delete task 'Old project'"
Agent: Calls list_tasks with search="Old project", then delete_task with found task_id

User: "Remove all completed tasks"
Agent: Calls list_tasks with status="completed", then calls delete_task for each
```

---

### 5. toggle_task

**Purpose**: Toggle task completion status

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "User ID from JWT token"
    },
    "task_id": {
      "type": "string",
      "format": "uuid",
      "description": "ID of task to toggle"
    }
  },
  "required": ["user_id", "task_id"]
}
```

**Output Schema**:
```json
{
  "type": "object",
  "properties": {
    "success": {"type": "boolean"},
    "data": {
      "type": "object",
      "properties": {
        "id": {"type": "string", "format": "uuid"},
        "title": {"type": "string"},
        "completed": {"type": "boolean"},
        "new_status": {"type": "string", "enum": ["completed", "pending"]}
      }
    },
    "error": {"type": ["string", "null"]}
  }
}
```

**Error Cases**:
- Task not found → `{"success": false, "error": "Task not found"}`
- Task belongs to different user → `{"success": false, "error": "Access denied"}`

**Agent Usage Examples**:
```
User: "Complete the task 'Buy groceries'"
Agent: Calls list_tasks with search="Buy groceries", then toggle_task with found task_id

User: "Uncheck task 5"
Agent: Calls toggle_task with task_id="5"
```

---

## Implementation Notes

### User Isolation Enforcement

**Application Layer**:
```python
# All tools follow this pattern
@mcp.tool()
def create_task(user_id: str, title: str, ...) -> dict:
    # Service layer enforces user isolation
    service = TaskService()
    try:
        result = service.create(user_id=user_id, title=title, ...)
        return {"success": True, "data": result.to_dict()}
    except Exception as e:
        return {"success": False, "error": str(e)}
```

**Service Layer**:
```python
class TaskService:
    def create(self, user_id: str, title: str, ...) -> Task:
        # All queries include user_id filter
        task = Task(user_id=user_id, title=title, ...)
        self.session.add(task)
        self.session.commit()
        return task

    def get_user_tasks(self, user_id: str, ...) -> List[Task]:
        # Base query always includes user_id
        query = select(Task).where(Task.user_id == user_id)
        # Additional filters applied here
        return results
```

### Error Response Pattern

**Consistent Format**:
```python
def tool_wrapper(user_id: str, ...) -> dict:
    try:
        # Validate user ownership
        if not validate_user_ownership(user_id):
            return {"success": False, "error": "Access denied"}

        # Execute operation
        result = service.operation(user_id, ...)
        return {"success": True, "data": result}

    except ValidationError as e:
        return {"success": False, "error": str(e)}

    except Exception as e:
        logger.error(f"Tool error: {e}")
        return {"success": False, "error": "Operation failed"}
```

### Type Safety

**Input Validation**:
- Pydantic models for all tool parameters
- Enum validation for priority/category
- UUID format validation for task_id
- Date format validation for due_date

**Output Consistency**:
- Always return `success`, `data`, `error` structure
- Data objects match existing Task model
- Timestamps in ISO format

### Performance Considerations

**Database Queries**:
- All queries use `user_id` index
- Connection pooling already configured
- No N+1 query issues

**Response Size**:
- Task lists limited to reasonable defaults
- Optional pagination for large result sets
- Minimal data transfer

## Integration with Agents

### Agent Tool Calling

**Orchestrator Agent**:
```python
orchestrator = Agent(
    name="Orchestrator",
    instructions="""Use MCP tools for task operations:
    - create_task: Add new tasks
    - list_tasks: View existing tasks
    - update_task: Modify tasks
    - delete_task: Remove tasks
    - toggle_task: Complete/incomplete tasks

    Always provide user_id from context.
    """,
    mcp_tools=["create_task", "list_tasks", "update_task", "delete_task", "toggle_task"]
)
```

**Urdu Agent**:
```python
urdu_agent = Agent(
    name="UrduSpecialist",
    instructions="""Respond in Urdu and use MCP tools when needed:
    - User requests in Urdu → respond in Urdu
    - Task operations → use MCP tools with user_id
    - Always maintain Urdu language
    """,
    mcp_tools=["create_task", "list_tasks", "update_task", "delete_task", "toggle_task"]
)
```

### Tool Discovery

**Automatic Registration**:
```python
# MCP server automatically exposes these tools
server = MCPServerStdio(
    params={
        "command": "uv",
        "args": ["run", "task_serves_mcp_tools.py"]
    }
)

# Agents discover tools automatically
await server.connect()
# Tools now available to agents
```

## Testing Strategy

### Unit Tests
- Each tool tested in isolation
- User isolation verified
- Error cases covered

### Integration Tests
- Agent → Tool → Database flow
- JWT authentication validation
- Multi-user scenarios

### End-to-End Tests
- Full user workflows via chat interface
- Language-specific scenarios (Urdu)
- Error recovery paths

## Security Checklist

- [ ] All tools require `user_id` parameter
- [ ] JWT validation on every request
- [ ] User ownership verification in service layer
- [ ] Input validation via Pydantic
- [ ] SQL injection prevention via parameterized queries
- [ ] No sensitive data in error messages
- [ ] Rate limiting on MCP endpoints
- [ ] Audit logging for sensitive operations

## Constitution Compliance

| Principle | Implementation |
|-----------|----------------|
| Universal Logic Decoupling | Tools call TaskService, not direct DB |
| AI-Native Interoperability | Strict schemas, natural language friendly |
| Strict Statelessness | No session state, per-request servers |
| Zero-Trust Multi-Tenancy | user_id in every query, JWT validation |

This specification provides the foundation for secure, scalable AI agent integration while maintaining full compliance with project architecture principles.