# Implementation Tasks: FastAPI Backend for Todo App

**Feature**: 005-fastapi-backend
**Branch**: `005-fastapi-backend`
**Date**: 2025-12-31
**Plan**: [specs/005-fastapi-backend/plan.md](plan.md)
**Spec**: [specs/005-fastapi-backend/spec.md](spec.md)

## Overview

This document contains all implementation tasks for the FastAPI Backend Todo Application. Tasks are organized by user story and follow a strict checklist format. Each task is independently testable and includes file paths for precise execution.

The backend integrates with Better Auth JWT tokens and shares the Neon PostgreSQL database with the frontend.

## Dependencies & Completion Order

```
Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3) → Phase 6 (US4) → Phase 7 (US5) → Phase 8 (Polish)
```

**MVP Scope**: User Stories 1-3 (P1) - View, Create, Update tasks

**Parallel Opportunities**:
- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel

---

## Phase 1: Setup (Project Initialization)

**Goal**: Initialize UV project structure and install dependencies

- [X] T001 Initialize backend with UV
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

- [X] T002 Add project dependencies with UV
  - **Files**: `phase-2/backend/pyproject.toml`
  - **Action**: Add all required dependencies using uv add
  - **Commands**:
    ```bash
    cd phase-2/backend
    uv add fastapi uvicorn[standard] sqlmodel asyncpg python-jose[cryptography] pydantic-settings
    uv add --dev pytest pytest-asyncio httpx
    ```
  - **Note**: Creates `uv.lock` file (commit this!)

- [X] T003 Create environment configuration
  - **Files**: `phase-2/backend/.env.example` (NEW), `phase-2/backend/src/backend/config.py` (NEW)
  - **Action**: Set up pydantic-settings for environment loading
  - **Variables**: DATABASE_URL, BETTER_AUTH_SECRET, HOST, PORT, DEBUG

- [X] T004 [P] Update .gitignore for backend
  - **Files**: `phase-2/backend/.gitignore`
  - **Action**: Add .env, __pycache__, .venv (UV creates .venv automatically)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Goal**: Core infrastructure that MUST be complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Create database connection module
  - **Files**: `phase-2/backend/src/backend/database.py` (NEW)
  - **Action**: Create SQLModel engine and session for Neon PostgreSQL
  - **Note**: Use same DATABASE_URL as frontend
  - **Requirements**: SSL mode, SQLModel create_engine with asyncpg

- [X] T006 Create task database table
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

- [X] T007 Implement JWT verification module
  - **Files**: `phase-2/backend/src/backend/auth/jwt.py` (NEW)
  - **Action**: Create verify_jwt() function using python-jose
  - **Requirements**:
    - Use BETTER_AUTH_SECRET for signature verification
    - Extract user_id (sub claim) from token
    - Handle expired/invalid tokens

- [X] T008 [P] Create auth middleware
  - **Files**: `phase-2/backend/src/backend/middleware/auth.py` (NEW)
  - **Action**: Create FastAPI dependency for authentication
  - **Features**:
    - Extract Bearer token from Authorization header
    - Verify JWT and extract user
    - Compare path user_id with token user_id
    - Return 401/403 for auth failures

- [X] T009 [P] Create SQLModel models for Task
  - **Files**: `phase-2/backend/src/backend/models/task.py` (NEW)
  - **Action**: Create SQLModel classes for Task entity
  - **Models**:
    - Task (SQLModel table=True)
    - TaskCreate, TaskUpdate (SQLModel table=False)
    - TaskListResponse, TaskDetailResponse (Pydantic via SQLModel)

- [X] T010 Create FastAPI app entry point
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

- [X] T011 Implement GET /api/{user_id}/tasks endpoint
  - **Files**: `phase-2/backend/src/backend/routes/tasks.py` (NEW)
  - **Action**: Create list tasks endpoint with filters
  - **Query Params**: status, priority, category, search, sort_by, order
  - **Response**: TaskListResponse with tasks, total, completed_count, pending_count

- [X] T012 Implement task filtering logic
  - **Files**: `phase-2/backend/src/backend/routes/tasks.py`
  - **Action**: Add SQL WHERE clauses for filters
  - **Filters**: status (pending/completed), priority, category, search

- [X] T013 Implement GET /api/{user_id}/tasks/{task_id} endpoint
  - **Files**: `phase-2/backend/src/backend/routes/tasks.py`
  - **Action**: Get single task by ID (with ownership check)
  - **Response**: TaskDetailResponse

**Checkpoint**: Users can view tasks - minimal read-only API working

---

## Phase 4: User Story 2 - Create Task (Priority: P1) 🎯 MVP

**Goal**: User can create new tasks

**Independent Test**: `POST /api/{user_id}/tasks` creates and returns task

- [X] T014 Implement POST /api/{user_id}/tasks endpoint
  - **Files**: `phase-2/backend/src/backend/routes/tasks.py`
  - **Action**: Create task with validation
  - **Request**: CreateTaskRequest (title, description, priority, category, due_date)
  - **Response**: TaskDetailResponse (201 Created)

- [X] T015 Add validation error handling
  - **Files**: `phase-2/backend/src/backend/routes/tasks.py`, `phase-2/backend/src/backend/main.py`
  - **Action**: Return proper error format for validation failures
  - **Format**: `{"error": {"code": "VALIDATION_ERROR", "message": "...", "details": {...}}}`

**Checkpoint**: Users can view AND create tasks - basic CRUD working

---

## Phase 5: User Story 3 - Update Task (Priority: P1) 🎯 MVP

**Goal**: User can update their tasks including toggling completion

**Independent Test**: `PUT /api/{user_id}/tasks/{task_id}` updates task

- [X] T016 Implement PUT /api/{user_id}/tasks/{task_id} endpoint
  - **Files**: `phase-2/backend/src/backend/routes/tasks.py`
  - **Action**: Update task with ownership check
  - **Request**: UpdateTaskRequest (all task fields)
  - **Response**: TaskDetailResponse

- [X] T017 Implement PATCH /api/{user_id}/tasks/{task_id}/complete endpoint
  - **Files**: `phase-2/backend/src/backend/routes/tasks.py`
  - **Action**: Toggle completed status
  - **Logic**: Flip boolean, update updated_at
  - **Response**: TaskDetailResponse

- [X] T018 Add ownership verification to all task endpoints
  - **Files**: `phase-2/backend/src/backend/routes/tasks.py`
  - **Action**: Verify task.user_id matches authenticated user
  - **Error**: 403 Forbidden if mismatch, 404 if not found

**Checkpoint**: Full task CRUD (except delete) working - MVP complete!

---

## Phase 6: User Story 4 - Delete Task (Priority: P2)

**Goal**: User can delete their tasks

**Independent Test**: `DELETE /api/{user_id}/tasks/{task_id}` removes task

- [X] T019 Implement DELETE /api/{user_id}/tasks/{task_id} endpoint
  - **Files**: `phase-2/backend/src/backend/routes/tasks.py`
  - **Action**: Delete task with ownership check
  - **Response**: 204 No Content

---

## Phase 7: User Story 5 - Profile Stats (Priority: P3)

**Goal**: User can view their profile with task statistics

**Independent Test**: `GET /api/{user_id}/profile` returns user info and stats

- [X] T020 Implement GET /api/{user_id}/profile endpoint
  - **Files**: `phase-2/backend/src/backend/routes/profile.py` (NEW)
  - **Action**: Return user info and task stats
  - **Data**: Query "user" table + count tasks

- [X] T021 Calculate task statistics
  - **Files**: `phase-2/backend/src/backend/routes/profile.py`
  - **Action**: Query counts for total, completed, pending
  - **Response**: UserProfileResponse

---

## Phase 8: Verification & Polish

**Goal**: Final validation and integration testing

- [X] T022 Test JWT authentication flow
  - **Files**: Browser + backend server
  - **Action**: Login on frontend, copy JWT, test backend with cURL
  - **Commands**:
    ```bash
    # Start backend
    cd phase-2/backend && uvicorn src.main:app --reload --port 8000

    # Test with JWT from frontend
    curl -H "Authorization: Bearer <jwt>" http://localhost:8000/api/<user_id>/tasks
    ```

- [X] T023 Frontend integration test
  - **Files**: `phase-2/frontend/.env.local`
  - **Action**: Set NEXT_PUBLIC_DEMO_MODE=false, test full app
  - **Verify**: Create task on frontend → appears in database → persists on refresh
  - **Files**: `phase-2/frontend/src/app/(dashboard)/tasks/page.tsx`
  - **Action**: Move filtering, searching, and sorting from server-side to client-side
  - **Implementation**:e
    - Fetch all tasks once without filter/sort params
    - Apply filters (status, priority, category) client-side using Array.filter()
    - Apply search (title, description) client-side with debounced query
    - Apply sorting (created_at, due_date, priority, title) client-side using Array.sort()
    - Use React.useMemo() for performance optimization
  - **Benefits**:
    - Instant filter/sort changes without API calls
    - Reduced server load
    - Better UX with immediate feedback
  - **Verify**: Changing filters/sort is instant, no loading states triggered

- [X] T024 Final verification checklist
  - **Checklist**:
    - [X] GET tasks returns user's tasks ✅
    - [X] POST creates task with correct user_id ✅
    - [X] PUT updates task ✅
    - [X] PATCH toggles completion ✅
    - [X] DELETE removes task ✅
    - [X] Profile shows stats ✅
    - [X] Frontend filtering and sorting ✅
    - [X] Invalid JWT returns 401 ✅
    - [X] Wrong user returns 403 ✅
    - [X] Frontend works with demo mode OFF ✅

---

## Parallel Execution Examples

### Phase 2: Foundational (All tasks can run in parallel)
```bash
# Terminal 1: Database connection (T005)
cd phase-2/backend && uv run python -c "from src.backend.database import engine; print('DB OK')"

# Terminal 2: JWT module (T007)
cd phase-2/backend && uv run python -c "from src.backend.auth.jwt import verify_jwt; print('JWT OK')"

# Terminal 3: Models (T009)
cd phase-2/backend && uv run python -c "from src.backend.models.task import Task; print('Models OK')"

# Terminal 4: Middleware (T008)
cd phase-2/backend && uv run python -c "from src.backend.middleware.auth import get_current_user; print('Middleware OK')"
```

### Phase 3: User Story 1 Implementation
```bash
# Terminal 1: Main endpoint (T011)
# Terminal 2: Filtering logic (T012)
# Terminal 3: Single task endpoint (T013)
# All can be developed simultaneously as they're in the same file but independent functions
```

### Phase 4 & 5: User Stories 2 & 3 (Can run in parallel)
```bash
# Team Member A: User Story 2 (Create)
# - T014: POST endpoint
# - T015: Validation handling

# Team Member B: User Story 3 (Update)
# - T016: PUT endpoint
# - T017: PATCH complete endpoint
# - T018: Ownership verification
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)
1. **Complete Phase 1**: Setup (T001-T004)
2. **Complete Phase 2**: Foundational (T005-T010) - **CRITICAL - blocks all stories**
3. **Complete Phase 3**: User Story 1 (T011-T013)
4. **Complete Phase 4**: User Story 2 (T014-T015)
5. **Complete Phase 5**: User Story 3 (T016-T018)
6. **STOP and VALIDATE**: Test all MVP functionality
7. **Deploy/demo if ready**

### Incremental Delivery
1. **Setup + Foundational** → Foundation ready
2. **Add User Story 1** → Test independently → Deploy/Demo (View tasks)
3. **Add User Story 2** → Test independently → Deploy/Demo (Create tasks)
4. **Add User Story 3** → Test independently → Deploy/Demo (Update tasks)
5. Each story adds value without breaking previous stories

### Parallel Team Strategy
With multiple developers:
1. **Team completes Setup + Foundational together**
2. **Once Foundational is done**:
   - **Developer A**: User Story 1 (View tasks)
   - **Developer B**: User Story 2 (Create tasks)
   - **Developer C**: User Story 3 (Update tasks)
3. Stories complete and integrate independently

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

## Task Count Summary

**Total Tasks**: 24
**Setup Tasks**: 4 (T001-T004)
**Foundational Tasks**: 6 (T005-T010)
**User Story 1 Tasks**: 3 (T011-T013)
**User Story 2 Tasks**: 2 (T014-T015)
**User Story 3 Tasks**: 3 (T016-T018)
**User Story 4 Tasks**: 1 (T019)
**User Story 5 Tasks**: 2 (T020-T021)
**Polish Tasks**: 3 (T022-T024)

**MVP Tasks (US1-3)**: 14 tasks
**Parallel Opportunities**: 10+ tasks can be executed in parallel
**Estimated Duration**: 2-3 implementation sessions + 1 verification session

**Next Action**: Begin with Phase 1 Setup tasks (T001-T004)