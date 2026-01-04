---
id: 002
title: create implementation plan
stage: plan
date: 2025-12-31
surface: agent
model: claude-sonnet-4-5
feature: fastapi-backend
branch: 005-fastapi-backend
user: user
command: /sp.plan # Implementation Plan: FastAPI Backend
labels: ["plan", "fastapi", "backend", "implementation"]
links:
  spec: specs/005-fastapi-backend/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/005-fastapi-backend/plan.md
  - specs/005-fastapi-backend/data-model.md
  - specs/005-fastapi-backend/quickstart.md
  - specs/005-fastapi-backend/contracts/openapi.yaml
  - CLAUDE.md (updated)
tests:
  - Constitution Check: PASSED
  - Phase 0: No research needed (all requirements clear)
  - Phase 1: All artifacts generated

---

## Prompt

# Implementation Plan: FastAPI Backend


## Summary

Build a FastAPI Python backend that serves the existing Next.js Todo frontend. The backend will:
- Verify Better Auth JWT tokens for authentication
- Share the existing Neon PostgreSQL database (user data already exists)
- Implement CRUD endpoints for tasks
- Run on port 8000 to match frontend configuration

---

## Technical Context

**Language/Version**: Python 3.11+
**Package Manager**: UV (REQUIRED - Rust-based, replaces pip/poetry)
**Primary Dependencies**: FastAPI, uvicorn, SQLModel (REQUIRED - ORM), asyncpg, python-jose (JWT)
**Storage**: PostgreSQL (Neon) - existing database with Better Auth tables
**Testing**: pytest, httpx (for async testing)
**Target Platform**: Linux server / local development
**Project Type**: Backend API (separate from frontend)
**Performance Goals**: <200ms response time for all endpoints
**Constraints**: Must use UV for package management, must use SQLModel for ORM, must verify JWTs signed by BETTER_AUTH_SECRET
**Scale/Scope**: Single user testing initially, designed for multi-tenant

---

## Constitution Check

*GATE: Not applicable - no constitution file found*

---

## Project Structure

### Documentation (this feature)

```text
(project root)
├── backend-spec.md          # Feature specification
├── backend-plan.md          # This file - implementation plan
└── backend-tasks.md         # Task breakdown for implementation
```

### Source Code (repository root)

```text
phase-2/
├── frontend/                 # Existing Next.js frontend (unchanged)
└── backend/                  # NEW - FastAPI backend (UV package)
    ├── .gitignore
    ├── .python-version
    ├── pyproject.toml        # UV project config
    ├── uv.lock               # UV lockfile (commit this!)
    ├── README.md
    └── src/
        └── backend/          # Package structure (created by uv init --package)
            ├── __init__.py
            ├── main.py       # FastAPI app entry point
            ├── config.py     # Environment configuration
            ├── database.py   # SQLModel engine/session
            ├── auth/
            │   ├── __init__.py
            │   └── jwt.py    # JWT verification
            ├── models/
            │   ├── __init__.py
            │   └── task.py   # SQLModel models
            ├── routes/
            │   ├── __init__.py
            │   ├── tasks.py  # Task CRUD endpoints
            │   └── profile.py # Profile/stats endpoint
            └── middleware/
                ├── __init__.py
                └── auth.py   # JWT auth middleware
```

**Structure Decision**: UV package layout with `src/backend/` - created via `uv init --package backend`

---

## Database Schema

### Existing Tables (Better Auth - DO NOT MODIFY)

- `user` - User accounts (id, name, email, created_at, etc.)
- `session` - Active sessions
- `account` - OAuth accounts
- `verification` - Email verification
- `jwks` - JWT key storage

### New Table (Backend)

```sql
CREATE TABLE IF NOT EXISTS "task" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    priority VARCHAR(10) NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
    category VARCHAR(20) NOT NULL CHECK (category IN ('work', 'personal', 'shopping', 'health', 'other')),
    due_date DATE,
    user_id VARCHAR(255) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_task_user_id ON task(user_id);
CREATE INDEX idx_task_completed ON task(completed);
CREATE INDEX idx_task_priority ON task(priority);
CREATE INDEX idx_task_category ON task(category);
```

---

## Authentication Flow

```
┌─────────────┐     JWT Token        ┌─────────────┐
│   Frontend  │  ──────────────────▶ │   Backend   │
│  (Next.js)  │                      │  (FastAPI)  │
└─────────────┘                      └─────────────┘
      │                                     │
      │ Better Auth                         │ Verify JWT
      │ issues JWT                          │ with same secret
      ▼                                     ▼
┌─────────────┐                      ┌─────────────┐
│    Neon     │ ◀──────────────────  │  Extract    │
│  PostgreSQL │                      │  user_id    │
└─────────────┘                      └─────────────┘
```

1. Frontend gets JWT from Better Auth after login
2. Frontend sends `Authorization: Bearer <token>` to backend
3. Backend verifies JWT signature using `BETTER_AUTH_SECRET`
4. Backend extracts user_id from token payload
5. Backend filters all data by authenticated user_id

---

## API Endpoints Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/{user_id}/tasks` | GET | ✅ | List tasks with filters |
| `/api/{user_id}/tasks` | POST | ✅ | Create new task |
| `/api/{user_id}/tasks/{task_id}` | GET | ✅ | Get single task |
| `/api/{user_id}/tasks/{task_id}` | PUT | ✅ | Update task |
| `/api/{user_id}/tasks/{task_id}` | DELETE | ✅ | Delete task |
| `/api/{user_id}/tasks/{task_id}/complete` | PATCH | ✅ | Toggle completion |
| `/api/{user_id}/profile` | GET | ✅ | Get profile + stats |
| `/health` | GET | ❌ | Health check |

---

## Environment Variables

```bash
# Database (same as frontend)
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require"

# JWT Secret (MUST match frontend)
BETTER_AUTH_SECRET="same-32-char-secret-as-frontend"

# Server
HOST=0.0.0.0
PORT=8000
DEBUG=false
```

---

## Verification Plan

### Automated Tests

**Command**: `cd phase-2/backend && pytest tests/ -v`

1. **JWT Verification Tests** (`tests/test_auth.py`)
   - Test valid JWT decoding
   - Test expired JWT rejection
   - Test invalid signature rejection
   - Test missing token rejection

2. **Task Endpoint Tests** (`tests/test_tasks.py`)
   - Test CRUD operations with valid JWT
   - Test authorization (can't access other user's tasks)
   - Test filtering and sorting
   - Test validation errors

### Manual Verification

1. **Start backend**:
   ```bash
   cd phase-2/backend
   uv run uvicorn backend.main:app --reload --port 8000
   ```
2. **Test with cURL**:
   ```bash
   # Get JWT token from frontend (login first)
   # Then call backend:
   curl -H "Authorization: Bearer <token>" http://localhost:8000/api/<user_id>/tasks
   ```
3. **Frontend Integration**:
   - Set `NEXT_PUBLIC_DEMO_MODE=false` in frontend
   - Start both servers
   - Use frontend normally - tasks should persist

---

## Complexity Tracking

> No constitution violations identified
```

## Response snapshot

Successfully created comprehensive implementation plan for FastAPI backend. The plan includes:

### ✅ **Phase 0: Research** - SKIPPED (No unknowns)
- All technical requirements are clearly specified
- No NEEDS CLARIFICATION items identified
- Constitution compliance verified

### ✅ **Phase 1: Design & Contracts** - COMPLETED

**Generated Artifacts:**
1. **data-model.md** - Complete SQLModel definitions, database schema, validation rules
2. **quickstart.md** - Step-by-step setup guide with code examples
3. **contracts/openapi.yaml** - Full OpenAPI 3.0 specification
4. **plan.md** - Complete implementation plan with constitution check

**Key Design Decisions:**
- **UV Package Structure**: `src/backend/` layout via `uv init --package backend`
- **JWT Integration**: python-jose for verification, matches Better Auth secrets
- **SQLModel ORM**: Required by constitution, provides type safety
- **Zero-Trust Architecture**: All queries scoped to user_id
- **Async Database**: AsyncEngine + AsyncSession for FastAPI performance

### ✅ **Constitution Compliance** - PASSED

All 5 core principles satisfied:
- **Universal Logic Decoupling**: Business logic in service layer
- **AI-Native Interoperability**: Ready for MCP tool exposure
- **Strict Statelessness**: No in-memory sessions, JWT on every request
- **Event-Driven Decoupling**: Architecture supports future Kafka/Dapr
- **Zero-Trust Multi-Tenancy**: Row-level security enforced

### ✅ **Agent Context Updated**

CLAUDE.md now includes:
- Python 3.11+ with FastAPI stack
- SQLModel ORM requirement
- Neon PostgreSQL database context
- Backend API project type

---

## 🎯 **Ready for Implementation**

**Next Steps:**
1. Run `/sp.tasks` to generate detailed implementation tasks
2. Execute task breakdown for step-by-step coding
3. Begin with UV package initialization
4. Follow quickstart.md for complete setup

**All Phase 1 artifacts are complete and ready for Phase 2 task generation.**