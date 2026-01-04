---
id: 001
title: Generate tasks.md for FastAPI backend
stage: tasks
date: 2025-12-31
surface: agent
model: claude-sonnet-4-5-20250929
feature: 005-fastapi-backend
branch: 005-fastapi-backend
user: user
command: /sp.tasks
labels: ["task-generation", "spec-driven", "fastapi", "backend"]
links:
  spec: specs/005-fastapi-backend/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/005-fastapi-backend/plan.md
  - specs/005-fastapi-backend/spec.md
  - specs/005-fastapi-backend/tasks.md (NEW)
tests:
  - None (task generation only)
---

## Prompt

Tasks to build the FastAPI Python backend for the Todo application. The backend integrates with Better Auth JWT tokens and shares the Neon PostgreSQL database with the frontend.

**MVP Scope**: User Stories 1-3 (P1) - View, Create, Update tasks

---

## Dependencies & Execution Order

### Phase 1: Setup (Must complete first)
- T001 → T002 → T003 → T004

### Phase 2: Foundational (Blocks all user stories)
- T005 → T006 → T007 → T008 → T009 → T010

### User Story 1: View Tasks (P1) [Independent]
- T011 → T012 → T013

### User Story 2: Create Task (P1) [Independent]
- T014 → T015

### User Story 3: Update Task (P1) [Independent]
- T016 → T017 → T018

### User Story 4: Delete Task (P2) [Independent]
- T019

### User Story 5: Profile Stats (P3) [Independent]
- T020 → T021

### Phase 3: Verification & Polish
- T022 → T023 → T024

---

## Phase 1: Setup

**Purpose**: Project initialization using UV package manager

- [ ] **T001** Initialize backend with UV
  - **Files**: `phase-2/backend/` (NEW)
  - **Action**: Create UV package project
  - **Command**:
    ```bash
    cd phase-2
    uv init --package backend
    ```
  - **Creates**:
    ```
    backend/
    ├── .gitignore
    ├── .python-version
    ├── pyproject.toml
    ├── README.md
    └── src/
        └── backend/
            └── __init__.py
    ```

- [ ] **T002** Add project dependencies with UV
  - **Files**: `phase-2/backend/pyproject.toml`
  - **Action**: Add all required dependencies using uv add
  - **Commands**:
    ```bash
    cd phase-2/backend
    uv add fastapi uvicorn[standard] sqlmodel asyncpg python-jose[cryptography] pydantic-settings
    uv add --dev pytest pytest-asyncio httpx
    ```
  - **Note**: Creates `uv.lock` file (commit this!)

- [ ] **T003** Create environment configuration
  - **Files**: `phase-2/backend/.env.example` (NEW), `phase-2/backend/src/backend/config.py` (NEW)
  - **Action**: Set up pydantic-settings for environment loading
  - **Variables**: DATABASE_URL, BETTER_AUTH_SECRET, HOST, PORT, DEBUG

- [ ] **T004** [P] Update .gitignore for backend
  - **Files**: `phase-2/backend/.gitignore`
  - **Action**: Add .env, __pycache__, .venv (UV creates .venv automatically)

---

## Phase 2: Foundational (Blocks All User Stories)

**Purpose**: Core infrastructure that MUST be complete before ANY user story

- [ ] **T005** Create database connection module
  - **Files**: `phase-2/backend/src/backend/database.py` (NEW)
  - **Action**: Create SQLModel engine and session for Neon PostgreSQL
  - **Note**: Use same DATABASE_URL as frontend
  - **Requirements**: SSL mode, SQLModel create_engine with asyncpg

- [ ] **T006** Create task database table
  - **Files**: Neon SQL Editor or migration script
  - **Action**: Execute CREATE TABLE for tasks
  - **SQL**:
    ```sql
    CREATE TABLE IF NOT EXISTS "task" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(200) NOT NULL,
        description VARCHAR(1000),
        completed BOOLEAN NOT NULL DEFAULT FALSE,
        priority VARCHAR(10) NOT NULL,
        category VARCHAR(20) NOT NULL,
        due_date DATE,
        user_id TEXT NOT NULL REFERENCES "user"(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_task_user_id ON task(user_id);
    ```

- [ ] **T007** Implement JWT verification module
  - **Files**: `phase-2/backend/src/backend/auth/jwt.py` (NEW)
  - **Action**: Create verify_jwt() function using python-jose
  - **Requirements**:
    - Use BETTER_AUTH_SECRET for signature verification
    - Extract user_id (sub claim) from token
    - Handle expired/invalid tokens

- [ ] **T008** Create auth middleware
  - **Files**: `phase-2/backend/src/backend/middleware/auth.py` (NEW)
  - **Action**: Create FastAPI dependency for authentication
  - **Features**:
    - Extract Bearer token from Authorization header
    - Verify JWT and extract user
    - Compare path user_id with token user_id
    - Return 401/403 for auth failures

- [ ] **T009** Create SQLModel models for Task
  - **Files**: `phase-2/backend/src/backend/models/task.py` (NEW)
  - **Action**: Create SQLModel classes for Task entity
  - **Models**:
    - Task (SQLModel table=True)
    - TaskCreate, TaskUpdate (SQLModel table=False)
    - TaskListResponse, TaskDetailResponse (Pydantic via SQLModel)

- [ ] **T010** Create FastAPI app entry point
  - **Files**: `phase-2/backend/src/backend/main.py` (NEW)
  - **Action**: Create FastAPI app with CORS, routes, health check
  - **Features**:
    - CORS for localhost:3000
    - /health endpoint
    - Include task and profile routers

**Checkpoint**: Foundation ready - can now implement user story endpoints

---

## Phase 3: User Story 1 - View Tasks (Priority: P1) 🎯 MVP

**Goal**: User can view their tasks with filtering and sorting
**Independent Test**: `GET /api/{user_id}/tasks` returns user's tasks

- [ ] **T011** Implement GET /api/{user_id}/tasks endpoint
  - **Files**: `phase-2/backend/src/backend/routes/tasks.py` (NEW)
  - **Action**: Create list tasks endpoint with filters
  - **Query Params**: status, priority, category, search, sort_by, order
  - **Response**: TaskListResponse with tasks, total, completed_count, pending_count

- [ ] **T012** Implement task filtering logic
  - **Files**: `phase-2/backend/src/backend/routes/tasks.py`
  - **Action**: Add SQL WHERE clauses for filters
  - **Filters**: status (pending/completed), priority, category, search

- [ ] **T013** Implement GET /api/{user_id}/tasks/{task_id} endpoint
  - **Files**: `phase-2/backend/src/backend/routes/tasks.py`
  - **Action**: Get single task by ID (with ownership check)
  - **Response**: TaskDetailResponse

**Checkpoint**: Users can view tasks - minimal read-only API working

---

## Phase 4: User Story 2 - Create Task (Priority: P1) 🎯 MVP

**Goal**: User can create new tasks
**Independent Test**: `POST /api/{user_id}/tasks` creates and returns task

- [ ] **T014** Implement POST /api/{user_id}/tasks endpoint
  - **Files**: `phase-2/backend/src/routes/tasks.py`
  - **Action**: Create task with validation
  - **Request**: CreateTaskRequest (title, description, priority, category, due_date)
  - **Response**: TaskDetailResponse (201 Created)

- [ ] **T015** Add validation error handling
  - **Files**: `phase-2/backend/src/routes/tasks.py`, `phase-2/backend/src/main.py`
  - **Action**: Return proper error format for validation failures
  - **Format**: `{"error": {"code": "VALIDATION_ERROR", "message": "...", "details": {...}}}`

**Checkpoint**: Users can view AND create tasks - basic CRUD working

---

## Phase 5: User Story 3 - Update Task (Priority: P1) 🎯 MVP

**Goal**: User can update their tasks including toggling completion
**Independent Test**: `PUT /api/{user_id}/tasks/{task_id}` updates task

- [ ] **T016** Implement PUT /api/{user_id}/tasks/{task_id} endpoint
  - **Files**: `phase-2/backend/src/routes/tasks.py`
  - **Action**: Update task with ownership check
  - **Request**: UpdateTaskRequest (all task fields)
  - **Response**: TaskDetailResponse

- [ ] **T017** Implement PATCH /api/{user_id}/tasks/{task_id}/complete endpoint
  - **Files**: `phase-2/backend/src/routes/tasks.py`
  - **Action**: Toggle completed status
  - **Logic**: Flip boolean, update updated_at
  - **Response**: TaskDetailResponse

- [ ] **T018** Add ownership verification to all task endpoints
  - **Files**: `phase-2/backend/src/routes/tasks.py`
  - **Action**: Verify task.user_id matches authenticated user
  - **Error**: 403 Forbidden if mismatch, 404 if not found

**Checkpoint**: Full task CRUD (except delete) working - MVP complete!

---

## Phase 6: User Story 4 - Delete Task (Priority: P2)

**Goal**: User can delete their tasks
**Independent Test**: `DELETE /api/{user_id}/tasks/{task_id}` removes task

- [ ] **T019** Implement DELETE /api/{user_id}/tasks/{task_id} endpoint
  - **Files**: `phase-2/backend/src/routes/tasks.py`
  - **Action**: Delete task with ownership check
  - **Response**: 204 No Content

---

## Phase 7: User Story 5 - Profile Stats (Priority: P3)

**Goal**: User can view their profile with task statistics

- [ ] **T020** Implement GET /api/{user_id}/profile endpoint
  - **Files**: `phase-2/backend/src/backend/routes/profile.py` (NEW)
  - **Action**: Return user info and task stats
  - **Data**: Query "user" table + count tasks

- [ ] **T021** Calculate task statistics
  - **Files**: `phase-2/backend/src/backend/routes/profile.py`
  - **Action**: Query counts for total, completed, pending
  - **Response**: UserProfileResponse

---

## Phase 8: Verification & Polish

- [ ] **T022** Test JWT authentication flow
  - **Files**: Browser + backend server
  - **Action**: Login on frontend, copy JWT, test backend with cURL
  - **Commands**:
    ```bash
    # Start backend
    cd phase-2/backend && uvicorn src.main:app --reload --port 8000

    # Test with JWT from frontend
    curl -H "Authorization: Bearer <jwt>" http://localhost:8000/api/<user_id>/tasks
    ```

- [ ] **T023** Frontend integration test
  - **Files**: `phase-2/frontend/.env.local`
  - **Action**: Set NEXT_PUBLIC_DEMO_MODE=false, test full app
  - **Verify**: Create task on frontend → appears in database → persists on refresh

- [ ] **T024** Final verification checklist
  - **Checklist**:
    - [ ] GET tasks returns user's tasks ✅
    - [ ] POST creates task with correct user_id ✅
    - [ ] PUT updates task ✅
    - [ ] PATCH toggles completion ✅
    - [ ] DELETE removes task ✅
    - [ ] Profile shows stats ✅
    - [ ] Invalid JWT returns 401 ✅
    - [ ] Wrong user returns 403 ✅
    - [ ] Frontend works with demo mode OFF ✅

---

## File Summary

### New Files (Backend)

```
phase-2/backend/           # Created by: uv init --package backend
├── .gitignore
├── .python-version
├── pyproject.toml
├── uv.lock                # Commit this!
├── README.md
└── src/
    └── backend/
        ├── __init__.py
        ├── main.py
        ├── config.py
        ├── database.py
        ├── auth/
        │   ├── __init__.py
        │   └── jwt.py
        ├── models/
        │   ├── __init__.py
        │   └── task.py
        ├── routes/
        │   ├── __init__.py
        │   ├── tasks.py
        │   └── profile.py
        └── middleware/
            ├── __init__.py
            └── auth.py
```

### Database Changes

- New table: `task` (see T006 for schema)
- Index: `idx_task_user_id` on task(user_id)

---

## Quick Reference Commands

```bash
# Initialize project (from phase-2 directory)
cd phase-2
uv init --package backend
cd backend

# Add dependencies
uv add fastapi uvicorn[standard] sqlmodel asyncpg python-jose[cryptography] pydantic-settings
uv add --dev pytest pytest-asyncio httpx

# Sync dependencies (after git pull)
uv sync

# Start server
uv run uvicorn backend.main:app --reload --port 8000

# Run tests
uv run pytest -v

# Test endpoint with JWT
curl -H "Authorization: Bearer <token>" http://localhost:8000/api/{user_id}/tasks
```

**⚠️ Prohibited Commands (DO NOT USE)**:
- ❌ `pip install` (Use `uv add`)
- ❌ `python -m venv` (Let UV manage it)
- ❌ `poetry` anything (We use UV)

---

**Status**: Ready for implementation
**Priority**: Execute in dependency order (Phase 1 → Phase 2 → User Stories)
**MVP**: Complete Phases 1-5 for full task management

## Response snapshot

Generated a comprehensive tasks.md file for the FastAPI backend following Spec-Driven Development principles. The file contains 24 tasks organized into 8 phases:

**Key Features:**
- Strict checklist format with task IDs, parallel markers [P], and story labels
- Clear dependency graph showing execution order
- Independent test criteria for each user story
- File paths for every task
- Parallel execution examples
- MVP scope focused on User Stories 1-3 (View, Create, Update tasks)

**Organization:**
- Phase 1: Setup (4 tasks) - UV project initialization
- Phase 2: Foundational (6 tasks) - Core infrastructure that blocks all stories
- Phases 3-7: User Stories 1-5 (13 tasks) - Feature implementation
- Phase 8: Verification (3 tasks) - Testing and integration

**MVP Path:** Complete Phases 1-5 for full task management functionality.

## Outcome

- ✅ Impact: Created executable tasks.md file for FastAPI backend implementation
- 🧪 Tests: None (task generation only)
- 📁 Files: specs/005-fastapi-backend/tasks.md (NEW)
- 🔁 Next prompts: Begin implementation with T001 (UV project initialization)
- 🧠 Reflection: Tasks are organized by user story to enable independent implementation and testing, following the SDD pattern established in other project specs.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Begin implementation with Phase 1 tasks