---
id: 0001
title: Minikube deployment authentication fixes
stage: green
date: 2026-01-26
surface: agent
model: claude-opus-4-5
feature: 009-minikube-deployment
branch: 009-minikube-deployment
user: gordon
command: /sp.phr
labels: ["minikube","kubernetes","authentication","chatkit","docker","helm"]
links:
  spec: specs/009-minikube-deployment/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - phase-4/frontend/src/lib/auth/auth.ts
 - phase-4/frontend/Dockerfile
 - phase-4/backend/Dockerfile
 - phase-4/helm-charts/todo-backend/values.yaml
 - phase-4/helm-charts/todo-frontend/values.yaml
 - phase-4/frontend/src/app/api/chatkit/route.ts
tests:
 - User login flow (authentication with Better Auth)
 - Task listing (authenticated API calls)
 - ChatKit message streaming (MCP tools integration)
---

## Prompt

create a phr for the fixes we implimented

## Response snapshot

Completed comprehensive fixes for Minikube deployment authentication and ChatKit integration:

1. **Authentication Flow**: Fixed Better Auth trusted origins by adding `http://127.0.0.1:3000` to `src/lib/auth/auth.ts`
2. **Database Connection**: Added `DATABASE_URL_PG` (PostgreSQL format for frontend's pg library) alongside SQLAlchemy-format `DATABASE_URL`
3. **Service Architecture**: Changed backend from ClusterIP to LoadBalancer for local Minikube access at `http://localhost:8000`
4. **Environment Variables**: Added critical missing vars to backend (`BETTER_AUTH_URL`, `HOST`, `PORT`) and server-side `BACKEND_URL` to frontend
5. **Docker Builds**: Updated Dockerfiles with build args for `NEXT_PUBLIC_*` variables and fixed missing file copies (`README.md`, `task_serves_mcp_tools.py`)
6. **ChatKit Proxy**: Fixed `/api/chatkit` route to use internal Kubernetes service URL for server-side requests

All services now running successfully with working authentication, task listing, and ChatKit streaming.

## Outcome

- ✅ Impact: Minikube deployment fully functional with authentication, task CRUD, and ChatKit AI assistant working
- 🧪 Tests: User login successful, tasks load from database, ChatKit streams responses
- 📁 Files: 7 files modified (Dockerfiles, Helm values, auth config, proxy route)
- 🔁 Next prompts: Continue with Phase 4 (staging environment) or Phase 5 (production-like environment with Ingress)
- 🧠 Reflection: The main issue was mixing client-side and server-side environment contexts. Server-side code (inside Kubernetes pods) needs internal service URLs, while client-side code (browser) needs localhost URLs. Better Auth JWT validation requires backend to know frontend's URL for fetching JWKS.

## Evaluation notes (flywheel)

- Failure modes observed: Initial 403 Forbidden errors due to missing trusted origin; 500 errors from missing DATABASE_URL; 401 Unauthorized from missing BETTER_AUTH_URL; ECONNREFUSED for ChatKit due to wrong URL context; ChatKit StreamError from missing MCP tools file in Docker image
- Graders run and results (PASS/FAIL): Authentication PASS, Task listing PASS, ChatKit streaming PASS, Full integration flow PASS
- Prompt variant (if applicable): None
- Next experiment (smallest change to try): For production deployment, implement Ingress controller with domain-based routing to replace LoadBalancer pattern and properly secure backend behind internal-only services
