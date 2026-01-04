# Implementation Plan: FastAPI Backend for Todo App

**Branch**: `005-fastapi-backend` | **Date**: 2025-12-31 | **Spec**: [specs/005-fastapi-backend/spec.md](../spec.md)
**Input**: Feature specification from `/specs/005-fastapi-backend/spec.md`

**Note**: This plan follows the Spec-Driven Development workflow for building a FastAPI backend that integrates with existing Better Auth authentication and Neon PostgreSQL database.

## Summary

Build a FastAPI Python backend that serves the existing Next.js Todo frontend. The backend will:
- Verify Better Auth JWT tokens for authentication
- Share the existing Neon PostgreSQL database (user data already exists)
- Implement CRUD endpoints for tasks with filtering, search, and sorting
- Run on port 8000 to match frontend configuration
- Enforce zero-trust multi-tenancy by scoping all queries to authenticated user_id

**Technical Approach**: UV package manager + SQLModel ORM + FastAPI framework with JWT verification middleware

## Technical Context

**Language/Version**: Python 3.11+ (per specification)
**Package Manager**: UV (REQUIRED - Rust-based, replaces pip/poetry)
**Primary Dependencies**: FastAPI, uvicorn, SQLModel (REQUIRED - ORM), asyncpg, python-jose (JWT), pydantic
**Storage**: PostgreSQL (Neon - existing database with Better Auth tables)
**Testing**: pytest, httpx (for async testing)
**Target Platform**: Linux server / local development
**Project Type**: Backend API (separate from frontend)
**Performance Goals**: <200ms response time for all endpoints
**Constraints**: Must use UV for package management, must use SQLModel for ORM, must verify JWTs signed by BETTER_AUTH_SECRET
**Scale/Scope**: Single user testing initially, designed for multi-tenant

**No NEEDS CLARIFICATION items identified** - all technical requirements are specified in the feature spec and constitution.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ **PASSED** - No Constitution Violations

**I. Universal Logic Decoupling**: ✅ PASS
- Business logic (CRUD, JWT verification, filtering) will be in service layer
- Decoupled from FastAPI routes (presentation layer)
- Same logic can power future AI agents

**II. AI-Native Interoperability (MCP-First)**: ✅ PASS
- Backend will expose MCP-compatible tools for task management
- Tools will be stateless and strictly typed
- Design supports future AI agent integration

**III. Strict Statelessness**: ✅ PASS
- No in-memory session storage
- All state persisted to Neon PostgreSQL
- JWT verification on every request
- Ready for horizontal scaling

**IV. Event-Driven Decoupling**: ✅ PASS
- Current phase uses direct HTTP (acceptable for MVP)
- Architecture supports future migration to Kafka/Dapr events
- No direct coupling between microservices (single service currently)

**V. Zero-Trust Multi-Tenancy**: ✅ PASS
- All database queries scoped to authenticated user_id
- JWT validation on every endpoint
- Row-level security enforced in application layer
- Prevents cross-user data access

**Technology Stack**: ✅ PASS
- Python 3.11+ ✅
- FastAPI ✅
- SQLModel (REQUIRED) ✅
- UV package manager ✅
- Neon PostgreSQL ✅

**Security Protocols**: ✅ PASS
- Better Auth with JWT ✅
- No hardcoded secrets ✅
- Environment variables for configuration ✅

**CONCLUSION**: **GATE PASSED** - Ready to proceed to Phase 0 research

## Project Structure

### Documentation (this feature)

```text
specs/005-fastapi-backend/
├── spec.md              # Feature specification
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (to be generated)
├── data-model.md        # Phase 1 output (to be generated)
├── quickstart.md        # Phase 1 output (to be generated)
├── contracts/           # Phase 1 output (to be generated)
│   └── openapi.yaml     # API contract specification
└── checklists/
    └── requirements.md  # Quality validation checklist
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
    └── tests/
        ├── __init__.py
        ├── conftest.py       # Pytest configuration
        ├── test_auth.py      # JWT verification tests
        ├── test_tasks.py     # Task endpoint tests
        └── test_integration.py # End-to-end tests
```

**Structure Decision**: UV package layout with `src/backend/` - created via `uv init --package backend`. This follows Python best practices and matches the constitution's requirement for proper package structure. The backend is completely separate from the frontend, allowing independent deployment and scaling.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
