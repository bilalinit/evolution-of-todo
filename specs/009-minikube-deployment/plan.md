# Implementation Plan: Minikube Deployment for Phase-4 Application

**Branch**: `009-minikube-deployment` | **Date**: 2026-01-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-minikube-deployment/spec.md`

## Summary

Deploy the phase-4 frontend (Next.js 16 with ChatKit) and backend (FastAPI with OpenAI Agents SDK) applications to a local Minikube cluster using Docker containerization and Helm chart management. The deployment uses external Neon PostgreSQL database (no database pod), supports multiple deployment stages (dev, staging, production-like), and implements production-like service architecture with LoadBalancer for frontend and ClusterIP for backend.

## Technical Context

**Language/Version**: Node.js 20+ (frontend), Python 3.12+ (backend)
**Primary Dependencies**:
- Frontend: Next.js 16.1.1, React 19.2.3, Better Auth 1.4.9, @openai/chatkit-react 1.4.1, Framer Motion 12.23.26
- Backend: FastAPI 0.128.0, OpenAI Agents SDK 0.6.5, openai-chatkit 1.5.3, SQLModel 0.0.31, asyncpg 0.31.0
- Infrastructure: Docker, Kubernetes (Minikube), Helm 3.x

**Storage**: External Neon PostgreSQL (SSL required, serverless)
**Testing**: pytest 9.0.2 (backend), existing frontend test structure
**Target Platform**: Local Minikube cluster (Linux/WSL2)
**Project Type**: Web application (frontend + backend)
**Performance Goals**:
- Cold start time for pods: under 60 seconds
- Frontend page load: under 3 seconds
- Backend API response: under 500ms (p95)
- Image build time: under 10 minutes (first build)

**Constraints**:
- Frontend port: 3000
- Backend port: 8000
- Database: SSL mode required (sslmode=require)
- Build images in Minikube Docker (eval $(minikube docker-env))
- Image pull policy: IfNotPresent (not Always) for local builds
- LoadBalancer requires minikube tunnel for external access

**Scale/Scope**:
- Single-tenant application (user_id isolation)
- 2 services: frontend (Next.js), backend (FastAPI)
- External database: Neon PostgreSQL
- Support for 3 deployment stages: dev, staging, production-like

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Universal Logic Decoupling
**Status**: PASS
- Business logic resides in backend service layer (`backend/src/backend/services/task_service.py`)
- Frontend is presentation layer only (React components, API clients)
- No logic duplication across frontend/backend

### II. AI-Native Interoperability (MCP-First)
**Status**: PASS
- MCP tools exposed via `task_serves_mcp_tools.py` and `task_serves_mcp_tools_sync.py`
- ChatKit integration with OpenAI Agents SDK (`chatkit_server.py`)
- Stateless tool definitions (create_task, list_tasks, update_task, delete_task, toggle_task)

### III. Strict Statelessness
**Status**: PASS
- Backend uses asyncpg connection pooling (no in-memory state)
- All state persisted to Neon PostgreSQL
- ChatKit sessions stored in PostgresChatKitStore
- Pods can restart without data loss

### IV. Event-Driven Decoupling
**Status**: NOT APPLICABLE (Phase 4 scope)
- Event streams (Kafka/Redpanda) planned for Phase V
- Current implementation uses direct HTTP calls
- No event-driven architecture required for this deployment

### V. Zero-Trust Multi-Tenancy
**Status**: PASS
- All database queries scoped to authenticated `user_id`
- JWT validation on every request (`get_current_user` dependency)
- ChatKit store enforces user isolation in thread/message queries
- CORS configured for allowed origins only

### Technology Stack Integrity
**Status**: PASS
- Backend: Python 3.12+, FastAPI, SQLModel
- Frontend: Next.js 16+, TypeScript, Tailwind CSS
- Database: Neon Serverless PostgreSQL
- AI/Agents: OpenAI Agents SDK, MCP SDK, OpenAI ChatKit
- Infrastructure: Docker, Kubernetes (Minikube), Helm

### Data Consistency & Schema
**Status**: PASS
- Strict typing: Python Type Hints, Pydantic models
- TypeScript interfaces in frontend (`src/types/`)
- SQLModel code-first schema definitions

### Security Protocols
**Status**: PASS
- Authentication: Better Auth with JWT strategy
- Secrets: Environment variables (to be migrated to Kubernetes Secrets)
- Database: SSL required (sslmode=require)
- CORS: Configured in FastAPI middleware

### Deployment Portability
**Status**: PASS (target of this feature)
- Container-native design via Dockerfiles
- Configuration via environment variables
- Same images will run in Minikube and cloud Kubernetes

**Overall Constitution Check**: PASS - No violations identified

## Project Structure

### Documentation (this feature)

```text
specs/009-minikube-deployment/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   ├── k8s-resources.yaml
│   └── helm-values-reference.md
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
# Phase-4 Web application structure
phase-4/
├── frontend/                    # Next.js 16 frontend application
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   ├── components/         # React components (20+ UI components)
│   │   ├── lib/                # API client, auth, utilities
│   │   └── types/              # TypeScript interfaces
│   ├── Dockerfile              # Multi-stage Dockerfile (to be created)
│   ├── .dockerignore           # Build exclusions (to be created)
│   ├── package.json            # Dependencies
│   ├── next.config.ts          # Next.js config
│   ├── auth.config.ts          # Better Auth config
│   └── .env.demo               # Environment variables reference
├── backend/                     # FastAPI backend application
│   ├── src/backend/
│   │   ├── models/             # SQLModel models (task, chatkit)
│   │   ├── routes/             # API routes (tasks, profile)
│   │   ├── services/           # Business logic (task_service)
│   │   ├── middleware/         # Auth middleware
│   │   ├── agents.py           # OpenAI Agents SDK setup
│   │   ├── chatkit_server.py   # ChatKit server implementation
│   │   ├── chatkit_store.py    # PostgresChatKitStore
│   │   ├── database.py         # asyncpg connection pool
│   │   ├── config.py           # Settings from env vars
│   │   ├── exceptions.py       # Exception handlers
│   │   └── main.py             # FastAPI app entry point
│   ├── scripts/                # Utility scripts (init_db, tests)
│   ├── task_serves_mcp_tools.py  # MCP server entry point
│   ├── Dockerfile              # Multi-stage Dockerfile (to be created)
│   ├── .dockerignore           # Build exclusions (to be created)
│   ├── pyproject.toml          # uv package configuration
│   └── .env.example            # Environment variables reference
└── helm-charts/                 # Helm charts (to be created)
    ├── frontend/               # Frontend Helm chart
    │   ├── Chart.yaml
    │   ├── values.yaml         # Configuration values
    │   └── templates/          # Kubernetes resource templates
    └── backend/                # Backend Helm chart
        ├── Chart.yaml
        ├── values.yaml         # Configuration values
        └── templates/          # Kubernetes resource templates
```

**Structure Decision**: Web application with separate frontend and backend directories. This is the standard pattern for the project (detected from existing phase-4 structure). The deployment will create Docker containers for each service and deploy them via Helm charts to Minikube.

### Kubernetes Resources (to be created via Helm)

```text
# Kubernetes namespace structure (per deployment stage)
Namespace: default (dev), staging (staging), production (prod)
├── Pods
│   ├── frontend-<hash>         # Next.js container
│   └── backend-<hash>          # FastAPI container
├── Services
│   ├── frontend                # LoadBalancer (external access via tunnel)
│   └── backend                 # ClusterIP (internal only)
├── Deployments
│   ├── frontend                # Frontend deployment
│   └── backend                 # Backend deployment
├── Secrets
│   ├── app-secrets             # DATABASE_URL, API keys (manual creation)
│   └── jwt-secrets             # BETTER_AUTH_SECRET (manual creation)
└── ConfigMaps (optional)
    ├── frontend-config         # Non-sensitive frontend config
    └── backend-config          # Non-sensitive backend config
```

## Complexity Tracking

> **No constitution violations to justify.** This section remains empty as all gates passed.

---

## Phase 0: Research & Technical Decisions

### Research Tasks

The following `NEEDS CLARIFICATION` items from Technical Context must be resolved:

1. **Docker Image Design**
   - Research: Multi-stage Dockerfile patterns for Next.js 16 with standalone output
   - Research: Multi-stage Dockerfile patterns for FastAPI with uv package manager
   - Decision: Use node:20-alpine for frontend, python:3.12-slim for backend

2. **Helm Chart Configuration**
   - Research: Helm 3.x chart structure for LoadBalancer vs ClusterIP services
   - Research: Environment variable injection via values.yaml vs Kubernetes Secrets
   - Decision: LoadBalancer for frontend (with minikube tunnel), ClusterIP for backend

3. **Service Discovery**
   - Research: Kubernetes DNS for inter-service communication
   - Decision: Frontend uses `http://backend:8000` (service name as DNS)

4. **Database Connection**
   - Research: External PostgreSQL connection from Kubernetes pods
   - Decision: Use Neon PostgreSQL with sslmode=require, credentials via Kubernetes Secrets

5. **Health Checks**
   - Research: Kubernetes liveness/readiness probe patterns
   - Decision: Backend `/health` endpoint, frontend `/` root path

6. **Build Context**
   - Research: Minikube Docker environment setup
   - Decision: `eval $(minikube docker-env)` before building images

### Research Findings Summary

**Resolved in**: `specs/009-minikube-deployment/research.md`

See research.md for detailed decisions on:
- Docker multi-stage build patterns
- Helm chart customization
- Kubernetes service types and DNS
- Secret management patterns
- Health check configuration
- Build and deployment workflow

---

## Phase 1: Design & Contracts

### Data Model

**Output**: `specs/009-minikube-deployment/data-model.md`

Kubernetes resource definitions and data flow:
- Pod specifications (containers, ports, environment variables)
- Service definitions (LoadBalancer vs ClusterIP)
- Secret definitions (sensitive configuration)
- Deployment strategies (rolling updates, replica counts)

### API Contracts

**Output**: `specs/009-minikube-deployment/contracts/`

- `k8s-resources.yaml`: Complete Kubernetes resource specifications
- `helm-values-reference.md`: Helm values.yaml configuration reference

### Quick Start Guide

**Output**: `specs/009-minikube-deployment/quickstart.md`

Step-by-step deployment guide for developers.

### Agent Context Update

**Post-Phase 1**: Run `.specify/scripts/bash/update-agent-context.sh claude` to update agent-specific context files with new Kubernetes and Helm technology.

---

## Follow-ups & Risks

### Follow-ups (Max 3)
1. Consider implementing Ingress controller for domain-based routing (todo.local, api.todo.local)
2. Evaluate horizontal pod autoscaling for production-like deployments
3. Document production cloud deployment patterns (AWS EKS, Oracle OKE, Google GKE)

### Risks (Max 3)
1. **Minikube resource exhaustion**: Mitigate by documenting CPU/memory requirements and providing resource limit configurations
2. **Database connection issues**: Mitigate by validating SSL configuration and providing Neon-specific connection string examples
3. **Tunnel confusion**: Mitigate by clearly documenting the minikube tunnel requirement and providing troubleshooting steps

### Architectural Decision Recommendations

Based on the planning process, the following ADRs are suggested:

📋 **Architectural decision detected**: Minikube deployment architecture using LoadBalancer for frontend and ClusterIP for backend
   Document reasoning and tradeoffs? Run `/sp.adr minikube-service-architecture`

📋 **Architectural decision detected**: Multi-stage Docker builds with Alpine-based images for size optimization
   Document reasoning and tradeoffs? Run `/sp.adr docker-multi-stage-builds`

📋 **Architectural decision detected**: External Neon PostgreSQL database with Kubernetes Secrets for credentials
   Document reasoning and tradeoffs? Run `/sp.adr kubernetes-secrets-management`
