# Phase 4 - Local Kubernetes Deployment (Minikube)

Production-ready full-stack todo application deployed on local Kubernetes cluster using Minikube, Docker containerization, and Helm charts.

## 🛠️ Technology Stack

- **Next.js 16+** (App Router) - Modern React framework with server components
- **Python FastAPI** - Async Python web framework for high-performance APIs
- **Docker** - Container runtime for both frontend and backend
- **Kubernetes (Minikube)** - Local Kubernetes cluster for container orchestration
- **Helm 3.x** - Package manager for Kubernetes deployments
- **OpenAI ChatKit** - Complete ChatKit UI integration via CDN
- **OpenAI Agents SDK** - Dual-agent AI system (Orchestrator + UrduSpecialist)
- **MCP Protocol** - Model Context Protocol for tool integration
- **SQLModel** - Type-safe ORM for Python with async support
- **Neon Serverless PostgreSQL** - Cloud-native PostgreSQL database
- **Better Auth** - Complete authentication solution
- **Claude Code + Spec-Kit Plus** - Spec-driven development workflow

## 🎯 Overview

This phase adds **Kubernetes deployment** to the production-ready full-stack application:

**Local Development**: Run frontend and backend directly on your machine (from Phase 3)
**Minikube Deployment**: Production-like Kubernetes deployment with Helm charts

### Deployment Options

| Option | Use Case | URL |
|--------|----------|-----|
| **Local Development** | Quick iteration, debugging | http://localhost:3000 |
| **Minikube Deployment** | Production-like testing, container orchestration | http://127.0.0.1:3000 |

### Key Features
- ✅ **Complete ChatKit Integration**: Official OpenAI ChatKit UI via CDN
- ✅ **Dual-Agent AI System**: Orchestrator + UrduSpecialist with intelligent handoffs
- ✅ **MCP Tools**: 5 CRUD operations (create, list, update, delete, toggle) via natural language
- ✅ **Thread Persistence**: Automatic conversation storage in PostgreSQL with user isolation
- ✅ **Natural Language Tasks**: "Create a task for tomorrow", "Show my tasks", "میرے ٹاسک دکھاؤ"
- ✅ **Modern UI**: Technical Editorial design with cream/orange palette
- ✅ **Full CRUD**: Traditional task management + AI-powered chat interface
- ✅ **🆕 Kubernetes Deployment**: Minikube + Docker + Helm for production-like environment

## 🏗️ Project Structure

```
phase-4/
├── backend/                      # ChatKit + Agents + MCP Backend
│   ├── src/backend/
│   │   ├── main.py              # FastAPI app + ChatKit endpoints
│   │   ├── chatkit_server.py    # ChatKitServer implementation
│   │   ├── chatkit_store.py     # PostgreSQL store (14 methods)
│   │   ├── agents.py            # Dual-agent system (Orchestrator + UrduSpecialist)
│   │   ├── routes/              # API endpoints (tasks, profile)
│   │   ├── models/              # SQLModel entities (including chatkit.py)
│   │   ├── auth/                # JWT verification
│   │   ├── middleware/          # Auth middleware
│   │   ├── database.py          # PostgreSQL connection
│   │   └── config.py            # Environment config
│   ├── migrations/              # Database migrations
│   │   └── 001_chatkit_tables.sql
│   ├── task_serves_mcp_tools.py # MCP server with 5 CRUD tools
│   ├── Dockerfile               # 🆕 Multi-stage Docker build
│   ├── .dockerignore            # 🆕 Build exclusions
│   ├── pyproject.toml           # UV dependencies (openai packages)
│   ├── uv.lock                  # Lock file
│   ├── .env.example             # Environment reference
│   └── README.md                # Backend documentation
│
├── frontend/                     # Next.js 16+ frontend with ChatKit
│   ├── src/
│   │   ├── app/                 # App Router routes
│   │   │   ├── (auth)/          # Login/Signup pages
│   │   │   ├── (dashboard)/     # Protected routes
│   │   │   ├── chatkit/         # ChatKit Integration page
│   │   │   └── layout.tsx       # Root layout (includes ChatKit CDN)
│   │   ├── components/          # React components
│   │   │   ├── auth/            # Auth components
│   │   │   ├── tasks/           # Task components
│   │   │   ├── chat/            # ChatKit components
│   │   │   │   ├── ChatKitWidget.tsx
│   │   │   │   └── EnhancedChatKitWidget.tsx
│   │   │   ├── ui/              # UI primitives (20+)
│   │   │   └── layout/          # Layout components
│   │   ├── lib/                 # API client & utilities
│   │   │   ├── chatkit/         # ChatKit utilities
│   │   │   │   └── session.ts
│   │   ├── hooks/               # Custom hooks
│   │   ├── types/               # TypeScript definitions
│   │   └── providers/           # React providers
│   ├── Dockerfile               # 🆕 Multi-stage Docker build
│   ├── .dockerignore            # 🆕 Build exclusions
│   ├── next.config.ts           # 🆕 Standalone output enabled
│   ├── package.json             # Node dependencies (@openai/chatkit-react)
│   ├── .env.local               # Environment variables
│   └── README.md                # Frontend documentation
│
├── helm-charts/                  # 🆕 Helm charts for Kubernetes deployment
│   ├── MINIKUBE_GUIDE.md        # Complete Minikube deployment guide
│   ├── HELM_OPERATIONS.md       # Rollback, troubleshooting, maintenance
│   ├── todo-backend/            # Backend Helm chart
│   │   ├── Chart.yaml
│   │   ├── values.yaml          # Backend configuration
│   │   └── templates/           # Kubernetes resource templates
│   └── todo-frontend/           # Frontend Helm chart
│       ├── Chart.yaml
│       ├── values.yaml          # Frontend configuration
│       └── templates/           # Kubernetes resource templates
│
└── README.md                     # This file (full-stack overview)
```

## 🚀 Quick Start

Choose your development workflow:

---

### Option 1: Local Development (Quick Iteration)

#### Prerequisites
- **Node.js 20+** (for frontend)
- **Python 3.12+** (for backend)
- **UV package manager** (for backend)
- **Neon PostgreSQL database** (shared)

#### Step 1: Setup Backend

```bash
cd phase-4/backend

# Install dependencies
uv sync

# Create environment file
cp .env.example .env

# Edit .env with your values:
# DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require
# BETTER_AUTH_SECRET=your-32-char-secret
# OPENAI_API_KEY=sk-...
# XIAOMI_API_KEY=your_xiaomi_api_key_here
# PORT=8000
# MCP_SERVER_TIMEOUT=30

# Setup ChatKit tables
python setup_chatkit.py
```

#### Step 2: Setup Frontend

```bash
cd phase-4/frontend

# Install dependencies
npm install

# Create environment file
cp .env.demo .env.local

# Edit .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_DEMO_MODE=false
# BETTER_AUTH_SECRET=your-32-char-secret
# DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require
```

#### Step 3: Run Both Applications

**Terminal 1 - Backend:**
```bash
cd phase-4/backend
uv run uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Frontend:**
```bash
cd phase-4/frontend
npm run dev
```

#### Step 4: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

### Option 2: Minikube Deployment (Production-Like)

#### Prerequisites
- **Docker Desktop** (with WSL2 integration enabled)
- **Minikube 1.30+**
- **kubectl**
- **Helm 3.x**
- **Neon PostgreSQL database**

#### Quick Start

```bash
# 1. Start Minikube
minikube start

# 2. Configure Docker environment
eval $(minikube docker-env)

# 3. Create Kubernetes Secret with your credentials
kubectl create secret generic app-secrets \
  --from-literal=DATABASE_URL='postgresql+asyncpg://user:password@ep-xxx.aws.neon.tech/db?sslmode=require' \
  --from-literal=DATABASE_URL_PG='postgresql://user:password@ep-xxx.aws.neon.tech/db?sslmode=require' \
  --from-literal=OPENAI_API_KEY='sk-xxxxxx' \
  --from-literal=XIAOMI_API_KEY='sk-your_xiaomi_api_key' \
  --from-literal=BETTER_AUTH_SECRET='your-secret-key-min-32-chars' \
  --from-literal=MCP_SERVER_TIMEOUT='30'

# 4. Build Docker images
cd phase-4
docker build -t todo-frontend:v1 ./frontend
docker build -t todo-backend:v1 ./backend

# 5. Deploy with Helm
cd helm-charts
helm install backend ./todo-backend
helm install frontend ./todo-frontend

# 6. Start minikube tunnel (in a NEW terminal)
minikube tunnel

# 7. Access application
# Frontend: http://127.0.0.1:3000
# Backend:  http://127.0.0.1:8000
```

#### 📖 Full Documentation

See **[MINIKUBE_GUIDE.md](helm-charts/MINIKUBE_GUIDE.md)** for complete deployment instructions, troubleshooting, and reference.

#### 🔧 Helm Operations

See **[HELM_OPERATIONS.md](helm-charts/HELM_OPERATIONS.md)** for rollback procedures, re-deployment workflow, and maintenance.

---

## 🐳 Docker Images

### Backend Image

**Base**: `python:3.12-slim` (with uv package manager)

**Multi-stage Build**:
1. **Builder**: Install dependencies with uv sync
2. **Production**: Copy only runtime dependencies and application code
3. **User**: Run as non-root user (appuser:appgroup)

**Image Size**: ~200MB
**Tag**: `todo-backend:v1`

### Frontend Image

**Base**: `node:20-alpine`

**Multi-stage Build**:
1. **Build**: Install dependencies and build Next.js standalone output
2. **Runner**: Production-ready runtime with built artifacts
3. **User**: Run as non-root user (nextjs:nodejs)

**Image Size**: ~289MB
**Tag**: `todo-frontend:v1`

---

## ☸️ Kubernetes Architecture

### Resources Deployed

| Resource | Type | Purpose |
|----------|------|---------|
| `backend-todo-backend` | Deployment | Backend pods with health checks |
| `frontend-todo-frontend` | Deployment | Frontend pods with health checks |
| `backend-todo-backend` | LoadBalancer | Backend service (internal/external) |
| `frontend-todo-frontend` | LoadBalancer | Frontend service (external) |
| `app-secrets` | Secret | Database URL, API keys, secrets |
| `backend-config` | ConfigMap | HOST, PORT, DEBUG configuration |

### Service Discovery

- **Frontend → Backend**: `http://backend-todo-backend:8000` (internal DNS)
- **Backend → Database**: External Neon PostgreSQL via `DATABASE_URL`
- **External Access**: LoadBalancer with minikube tunnel (127.0.0.1)

### Health Checks

**Backend**:
- Liveness: `/health` every 30s (fails after 3 failures)
- Readiness: `/health` every 10s (fails after 3 failures)

**Frontend**:
- Liveness: `/` every 30s
- Readiness: `/` every 10s

---

## 🔐 Authentication Flow

### How It Works

1. **User Registration/Login**: Frontend uses Better Auth to authenticate
2. **JWT Token**: Backend returns JWT token signed with same secret
3. **Storage**: Token stored in HTTP-only cookies
4. **API Calls**: Frontend includes token in `Authorization: Bearer <token>`
5. **Verification**: Backend verifies JWT and extracts user_id
6. **Authorization**: All database queries scoped to user_id

### Shared Configuration

Both frontend and backend must use the same:
- `BETTER_AUTH_SECRET` (32+ characters)
- `DATABASE_URL` (Neon PostgreSQL)
- JWT algorithm (HS256)

---

## 📡 API Endpoints

**ChatKit Integration:**
- `POST /api/chatkit` - Main ChatKit endpoint
- `POST /api/chatkit/session` - Create OpenAI ChatKit session
- `GET /api/chatkit/health` - ChatKit system health check

**Agent Communication:**
- `POST /api/chat` - Chat with dual-agent system
- `GET /api/chat/health` - Agent system health check

**Task Management:**
- `GET /api/{user_id}/tasks` - List with filters
- `GET /api/{user_id}/tasks/{task_id}` - Get single task
- `POST /api/{user_id}/tasks` - Create task
- `PUT /api/{user_id}/tasks/{task_id}` - Update task
- `PATCH /api/{user_id}/tasks/{task_id}/complete` - Toggle completion
- `DELETE /api/{user_id}/tasks/{task_id}` - Delete task

**Profile & Stats:**
- `GET /api/{user_id}/profile` - User info and task statistics

---

## 🎨 Design System

### Modern Technical Editorial

**Colors:**
- **Background**: Cream `#F9F7F2`
- **Accent**: Orange `#FF6B4A`
- **Text**: Dark brown `#2A1B12`
- **Borders**: Subtle `#2A1B12/10`

**Typography:**
- **Headings**: Playfair Display (serif)
- **Body**: DM Sans (sans-serif)
- **Labels**: JetBrains Mono (monospace)

**Components:**
- 20+ reusable UI primitives
- Technical buttons with subtle hover effects
- Clean cards with minimal borders
- Color-coded badges for priority/category

---

## 🤖 ChatKit Integration

### Complete ChatKit Flow

1. **User visits** `/chatkit` page
2. **ChatKit loads** OpenAI ChatKit via CDN
3. **Session created** via `/api/chatkit/session` with JWT
4. **User sends message** like "Create a task for tomorrow"
5. **ChatKit → Backend** → `/api/chatkit` processes request
6. **Dual-Agent Routing** → Orchestrator routes to UrduSpecialist if needed
7. **MCP Tool Execution** → Agent executes CRUD tools with user isolation
8. **Database Storage** → Task saved to PostgreSQL
9. **Response Streamed** → Back to ChatKit UI
10. **Thread Persisted** → Conversation saved to PostgreSQL

**Natural Language Examples:**
- "Create a task for tomorrow with high priority"
- "Show me all my pending tasks"
- "میرے ٹاسک دکھاؤ" (Urdu: Show my tasks)
- "Mark task as completed"
- "Delete the meeting task"

---

## 🗄️ Database Schema

### Shared Database (Neon PostgreSQL)

```sql
-- Task table
CREATE TABLE IF NOT EXISTS task (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    priority VARCHAR(10) NOT NULL,
    category VARCHAR(20) NOT NULL,
    due_date DATE,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ChatKit Threads table
CREATE TABLE chatkit_thread (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    thread_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ChatKit Thread Items table
CREATE TABLE chatkit_thread_item (
    id VARCHAR(255) PRIMARY KEY,
    thread_id VARCHAR(255) NOT NULL REFERENCES chatkit_thread(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'user_message', 'assistant_message', 'tool_call',
        'tool_result', 'system_message', 'error'
    )),
    content JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔧 Troubleshooting

### Local Development Issues

**1. API Connection Failed**
```bash
# Check backend is running
curl http://localhost:8000/health
```

**2. Authentication Errors**
- Ensure `BETTER_AUTH_SECRET` matches in both .env files
- Check `DATABASE_URL` format and SSL mode

### Minikube Issues

**1. ImagePullBackOff**
```bash
# Re-run docker-env and rebuild
eval $(minikube docker-env)
cd phase-4
docker build -t todo-backend:v1 ./backend
docker build -t todo-frontend:v1 ./frontend
kubectl rollout restart deployment/backend-todo-backend
```

**2. EXTERNAL-IP shows `<pending>`**
```bash
# Start tunnel in a NEW terminal
minikube tunnel
```

**3. Database Connection Errors**
```bash
# Verify secret
kubectl get secret app-secrets -o jsonpath='{.data.DATABASE_URL}' | base64 -d
```

For complete troubleshooting, see **[HELM_OPERATIONS.md](helm-charts/HELM_OPERATIONS.md)**.

---

## 📚 Documentation

### Phase 4 Documentation

**Specifications:**
- **Minikube Deployment**: `specs/009-minikube-deployment/spec.md`
- **ChatKit Integration**: `specs/008-chatkit-integration/spec.md`
- **Agent Foundation**: `specs/007-agents-mcp/spec.md`

**Architecture:**
- **Minikube Plan**: `specs/009-minikube-deployment/plan.md`
- **ChatKit Plan**: `specs/008-chatkit-integration/plan.md`
- **Agent Plan**: `specs/007-agents-mcp/plan.md`

**Implementation:**
- **Minikube Tasks**: `specs/009-minikube-deployment/tasks.md` (37/37 ✅)
- **ChatKit Tasks**: `specs/008-chatkit-integration/tasks.md` (164/164 ✅)
- **Agent Tasks**: `specs/007-agents-mcp/tasks.md` (98/98 ✅)

**Deployment Guides:**
- **Minikube Guide**: `helm-charts/MINIKUBE_GUIDE.md`
- **Helm Operations**: `helm-charts/HELM_OPERATIONS.md`

**PHRs**: `history/prompts/` (comprehensive development history)

---

## 🎯 Current Status

**Branch**: `009-minikube-deployment` ✅ Complete
**Total Tasks**: 37/37 (Phase 4 Minikube) + 164/164 (Phase 3 ChatKit) + 98/98 (Phase 2 Agents)
**Status**: ✅ **Phase 4 Complete - Minikube Deployment Ready**

### Phase 4 Completion (Minikube Deployment)
- ✅ **Dockerfiles**: Multi-stage builds for frontend and backend
- ✅ **Helm Charts**: Complete charts for backend and frontend
- ✅ **Kubernetes Deployment**: Deployed on local Minikube cluster
- ✅ **LoadBalancer Services**: External access via minikube tunnel
- ✅ **Health Checks**: Liveness and readiness probes configured
- ✅ **Secrets Management**: Kubernetes Secrets for credentials
- ✅ **Documentation**: MINIKUBE_GUIDE.md + HELM_OPERATIONS.md
- ✅ **Rollback Procedures**: Helm rollback and recovery documented

### Phase 3 Features (ChatKit + Agents + MCP)
- ✅ **ChatKit Integration**: Complete OpenAI ChatKit UI via CDN
- ✅ **Dual-Agent System**: Orchestrator + UrduSpecialist with handoffs
- ✅ **MCP Tools**: 5 CRUD operations via natural language
- ✅ **Thread Persistence**: Automatic chat storage in PostgreSQL
- ✅ **Natural Language Tasks**: English + Urdu support
- ✅ **Modern UI**: Technical Editorial design

---

## 🚀 Deployment Comparison

| Feature | Local Development | Minikube Deployment |
|---------|-------------------|---------------------|
| **Startup Time** | ~5 seconds | ~2 minutes (first run) |
| **Isolation** | Shared environment | Containerized pods |
| **Resource Limits** | None | CPU/memory limits configurable |
| **Health Checks** | Manual | Automatic (liveness/readiness) |
| **Rollback** | Manual restart | `helm rollback` (instant) |
| **Scaling** | N/A | Horizontal pod autoscaling |
| **Production-Like** | ❌ No | ✅ Yes |

---

## 🎯 Next Steps

**Ready for Phase V: Advanced Cloud Deployment**

Future enhancements:
- Deploy to Azure AKS / Google GKE / Oracle OKE
- Add Dapr for distributed application runtime
- Implement Kafka/Redpanda for event-driven architecture
- Add CI/CD pipeline with GitHub Actions
- Configure monitoring and logging

---

**Project**: Phase 4 - Local Kubernetes Deployment (Minikube)
**Branch**: `009-minikube-deployment`
**Architecture**: FastAPI + Next.js 16+ + Docker + Kubernetes (Minikube) + Helm + OpenAI ChatKit + OpenAI Agents SDK + MCP Protocol
**Status**: ✅ **Complete - Ready for Production Cloud Deployment**

### Complete Feature Set
- ✅ **ChatKit Integration**: Official OpenAI ChatKit UI via CDN
- ✅ **Dual-Agent AI System**: Orchestrator + UrduSpecialist
- ✅ **MCP Protocol**: 5 CRUD tools via natural language
- ✅ **Thread Persistence**: PostgreSQL storage with user isolation
- ✅ **Natural Language Tasks**: English + Urdu support
- ✅ **Modern UI**: Technical Editorial design
- ✅ **Full CRUD**: Traditional + AI-powered task management
- ✅ **Security**: Multi-layer user isolation
- ✅ **Docker**: Multi-stage container builds
- ✅ **Kubernetes**: Minikube deployment with Helm
- ✅ **Production-Like**: Health checks, secrets, rollback procedures

This application demonstrates a complete modern full-stack architecture with AI integration, container orchestration, and production-ready deployment patterns.
