# MCP Tools Specification: CLI Todo Application

## Overview
This document defines the MCP (Model Context Protocol) tools that will be exposed for AI agent integration in Phase II. These tools map directly to the core business logic used by the CLI.

## Tool Definitions

### 1. add_task
**Purpose**: Create a new todo task

**Input Schema**:
```json
{
  "title": {
    "type": "string",
    "minLength": 1,
    "maxLength": 500,
    "description": "Task description"
  }
}
```

**Output Schema**:
```json
{
  "id": "integer",
  "title": "string",
  "completed": "boolean",
  "created_at": "datetime"
}
```

**Error Cases**:
- Empty title → "Task title cannot be empty"
- Whitespace-only title → "Task title cannot be empty"

**CLI Equivalent**: `add` command

---

### 2. list_tasks
**Purpose**: Retrieve all tasks for current user

**Input Schema**:
```json
{
  "filter": {
    "type": "string",
    "enum": ["all", "completed", "pending"],
    "default": "all"
  }
}
```

**Output Schema**:
```json
{
  "tasks": [
    {
      "id": "integer",
      "title": "string",
      "completed": "boolean",
      "created_at": "datetime"
    }
  ],
  "total": "integer",
  "completed_count": "integer",
  "pending_count": "integer"
}
```

**CLI Equivalent**: `list` command

---

### 3. update_task
**Purpose**: Update task title

**Input Schema**:
```json
{
  "task_id": {
    "type": "integer",
    "description": "Task ID to update"
  },
  "new_title": {
    "type": "string",
    "minLength": 1,
    "maxLength": 500,
    "description": "New title (or empty to keep current)"
  }
}
```

**Output Schema**:
```json
{
  "id": "integer",
  "title": "string",
  "updated_at": "datetime"
}
```

**Error Cases**:
- Invalid task_id → "No task found with ID {id}"
- Empty new_title → "Task title cannot be empty"

**CLI Equivalent**: `update` command

---

### 4. delete_task
**Purpose**: Delete a task

**Input Schema**:
```json
{
  "task_id": {
    "type": "integer",
    "description": "Task ID to delete"
  }
}
```

**Output Schema**:
```json
{
  "success": "boolean",
  "deleted_task": {
    "id": "integer",
    "title": "string"
  }
}
```

**Error Cases**:
- Invalid task_id → "No task found with ID {id}"

**CLI Equivalent**: `delete` command

---

### 5. toggle_task
**Purpose**: Toggle task completion status

**Input Schema**:
```json
{
  "task_id": {
    "type": "integer",
    "description": "Task ID to toggle"
  }
}
```

**Output Schema**:
```json
{
  "id": "integer",
  "title": "string",
  "completed": "boolean",
  "new_status": "string"
}
```

**Error Cases**:
- Invalid task_id → "No task found with ID {id}"

**CLI Equivalent**: `toggle` command

---

## Implementation Notes

### User Context
All tools must enforce user scoping. The MCP server will extract user_id from the authentication context and apply it to all database queries.

### Error Handling
All tools should return structured error responses that can be understood by both AI agents and CLI users.

### State Management
Tools are stateless. Each tool call operates independently without maintaining session state.

### Type Safety
All tool inputs and outputs are strictly typed using JSON Schema, ensuring compatibility with AI agent type systems.

## Integration with CLI
The CLI will use the same core service layer (`TaskManager`) that these MCP tools will use, ensuring consistency between CLI and AI agent interfaces.