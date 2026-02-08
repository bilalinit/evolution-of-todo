# Hackathon Todo Project

A Spec-Driven Development (SDD) project demonstrating a complete full-stack application with modern technology stack:

## 🛠️ Core Technology Stack

- **Next.js 16+** (App Router) - Modern React framework with server components
- **Python FastAPI** - Async Python web framework for high-performance APIs
- **SQLModel** - Type-safe ORM for Python with async support
- **Neon Serverless PostgreSQL** - Cloud-native PostgreSQL database
- **Claude Code + Spec-Kit Plus** - Spec-driven development workflow
- **Better Auth** - Complete authentication solution
- **Dapr** (NEW) - Distributed application runtime for microservices 🆕
- **Kafka/Redpanda** (NEW) - Event-driven messaging system 🆕
- **Redis** (NEW) - State store for idempotency 🆕
- **Dapr** - Distributed application runtime for microservices 🆕
- **Kafka/Redpanda** - Event-driven messaging system 🆕
- **Redis** - State store for idempotency 🆕

## 📋 Project Overview

A Spec-Driven Development (SDD) project that demonstrates the complete evolution from CLI to web application. The project has progressed through **two CLI implementations** (command-based and menu-driven) and is now building a **modern Next.js web application** with authentication and advanced features.

## Project Overview

This project follows a **feature-driven development approach** with sequential branching and comprehensive documentation at every stage. It demonstrates how a project can evolve from simple CLI tools to a full-stack web application.

### Project Evolution
1. **Phase 1** (`phase-1/`): CLI Todo Application
   - **Branch 001**: Command-based CLI with direct commands ✅
   - **Branch 002**: Menu-driven CLI with visual interface ✅
   - **Status**: Both implementations complete and moved to phase-1 folder

2. **Phase 2** (`phase-2/`): Next.js Web Application
   - **Branch 003**: Modern web frontend with authentication setup ✅
   - **Branch 004**: Better Auth integration with profile features ✅
   - **Status**: Authentication system fully implemented and tested

3. **Phase 3** (`phase-3/`): ChatKit + Agents SDK + MCP tools Integration ✅ Complete
   - **Branch 007**: MCP Agent Integration with dual-agent system ✅
   - **Branch 008**: ChatKit + OpenAI Agents SDK integration ✅
   - **Status**: Complete ChatKit integration with dual-agent system, MCP tools, PostgreSQL persistence, and modern UI

4. **Phase 4** (`phase-4/`): Local Kubernetes Deployment (Minikube) ✅ Complete
   - **Branch 009**: Minikube deployment with Docker + Helm charts ✅
   - **Status**: Containerized deployment on local Kubernetes cluster with production-like infrastructure

5. **Phase 5** (`phase-5/`): Advanced Features + Microservices with Dapr ✅ **CURRENT**
   - **Branch 010**: Advanced Task Features (recurring tasks, reminders, tags) ✅
   - **Branch 011**: Microservices with Dapr + Event-Driven Architecture ✅
   - **Status**: Event-driven microservices with 6 services, real-time updates, automatic recurring tasks, reminder notifications, and complete audit trail 🆕

## 🚀 Current Status

- **Current Branch**: `011-microservices-dapr` ✅ Complete
- **Current Location**: `phase-5/backend/` + `phase-5/frontend/` + `phase-5/helm-charts/`
- **Deployment**: Docker Compose (local) or Minikube (Kubernetes with Dapr)
- **Previous Work**:
  - `phase-1/backend/` (CLI implementations) ✅ Complete
  - `phase-2/backend/` + `phase-2/frontend/` (Full-stack app) ✅ Complete
  - `phase-3/backend/` + `phase-3/frontend/` (ChatKit + Agents SDK + MCP tools Integration) ✅ Complete
  - `phase-4/backend/` + `phase-4/frontend/` + `helm-charts/` (Minikube Deployment) ✅ Complete
  - `phase-5/backend/` + `phase-5/frontend/` + `helm-charts/` (Microservices + Dapr) ✅ **CURRENT**
- **Base Branch**: `main` (stable)
- **Status**: ✅ **Phase 5 Complete - Event-Driven Microservices with Dapr** 🆕

## 📋 Project Structure

```
.
├── main/                         # Stable base branch
├── phase-1/                      # CLI Todo Applications (Completed ✅)
│   ├── backend/                  # CLI implementation with tests
│   │   ├── src/                  # Python source code
│   │   ├── tests/                # 147 unit & integration tests
│   │   ├── pyproject.toml        # Python dependencies
│   │   └── README.md             # CLI documentation
│   └── (branches: 001-cli-todo, 002-cli-menu-ui)
├── phase-2/                      # Full-Stack Application (Complete ✅)
│   ├── backend/                  # FastAPI Python backend
│   │   ├── src/backend/          # Python source code
│   │   │   ├── main.py           # FastAPI app entry
│   │   │   ├── routes/           # API endpoints (tasks, profile)
│   │   │   ├── models/           # SQLModel entities
│   │   │   ├── auth/             # JWT verification
│   │   │   ├── middleware/       # Auth middleware
│   │   │   ├── database.py       # PostgreSQL connection
│   │   │   └── config.py         # Environment config
│   │   ├── pyproject.toml        # UV dependencies
│   │   ├── uv.lock               # Lock file
│   │   └── scripts/              # Test scripts
│   ├── frontend/                 # Next.js 16+ application
│   │   ├── src/                  # TypeScript source
│   │   │   ├── app/              # App Router routes
│   │   │   ├── components/       # React components
│   │   │   ├── lib/              # API & utilities
│   │   │   ├── hooks/            # Custom hooks
│   │   │   └── types/            # TypeScript definitions
│   │   ├── package.json          # Node.js dependencies
│   │   └── README.md             # Frontend documentation
│   └── README.md                 # Phase 2 overview
├── phase-3/                      # ChatKit Integration ✅ Complete
│   ├── backend/                  # ChatKit + Agents Backend
│   │   ├── src/backend/          # Python source code
│   │   │   ├── agents.py         # Dual-agent system (Orchestrator + UrduSpecialist)
│   │   │   ├── main.py           # FastAPI with ChatKit endpoints
│   │   │   ├── chatkit_server.py # ChatKitServer implementation
│   │   │   ├── chatkit_store.py  # PostgreSQL store (14 methods)
│   │   │   ├── models/           # Data models (including chatkit.py)
│   │   │   └── services/         # TaskService with user isolation
│   │   ├── migrations/           # Database migrations
│   │   │   └── 001_chatkit_tables.sql
│   │   ├── task_serves_mcp_tools.py  # MCP server with 5 CRUD tools
│   │   ├── setup_chatkit.py      # Setup and validation script
│   │   ├── test_chatkit.py       # ChatKit session tests
│   │   ├── test_chatkit_session.py  # ChatKit session tests
│   │   ├── scripts/              # Integration tests
│   │   └── pyproject.toml        # UV dependencies (openai, openai-chatkit, openai-agents)
│   └── frontend/                 # ChatKit UI
│       ├── src/app/chatkit/      # ChatKit page
│       ├── src/components/chat/  # ChatKitWidget component
│       ├── src/lib/chatkit/      # Session utilities
│       └── src/app/api/chatkit/  # ChatKit proxy endpoint
├── phase-4/                      # Local Kubernetes Deployment (Complete ✅)
│   ├── backend/                  # FastAPI backend + Dockerfile
│   │   ├── src/backend/          # Python source code
│   │   ├── Dockerfile           # Multi-stage Docker build
│   │   └── .dockerignore        # Build exclusions
│   ├── frontend/                 # Next.js frontend + Dockerfile
│   │   ├── src/                  # TypeScript source
│   │   ├── Dockerfile           # Multi-stage Docker build
│   │   └── .dockerignore        # Build exclusions
│   ├── helm-charts/              # Helm charts for deployment
│   │   ├── MINIKUBE_GUIDE.md    # Deployment guide
│   │   ├── HELM_OPERATIONS.md   # Rollback & maintenance
│   │   ├── todo-backend/        # Backend Helm chart
│   │   └── todo-frontend/       # Frontend Helm chart
│   └── README.md                 # Phase 4 overview
├── phase-5/                      # Microservices + Dapr ✅ **CURRENT** 🆕
│   ├── backend/                  # FastAPI backend + Microservices
│   │   ├── src/backend/          # Python source code
│   │   │   ├── services/microservices/
│   │   │   │   ├── recurring_service.py     # Port 8001
│   │   │   │   ├── notification_service.py  # Port 8002
│   │   │   │   ├── audit_service.py         # Port 8003
│   │   │   │   └── websocket_service.py     # Port 8004
│   │   │   ├── utils/
│   │   │   │   ├── event_publisher.py       # Dapr pub/sub
│   │   │   │   ├── idempotency.py           # Duplicate prevention
│   │   │   │   └── dapr_state.py            # State management
│   │   │   ├── agents.py         # Dual-agent system
│   │   │   ├── chatkit_server.py # ChatKit integration
│   │   │   └── main.py           # Main API (port 8000)
│   │   ├── migrations/           # Database migrations
│   │   │   ├── 001_chatkit_tables.sql
│   │   │   ├── 002_advanced_features.sql
│   │   │   └── 003_dapr_state.sql
│   │   ├── Dockerfile            # Multi-stage Docker build
│   │   ├── pyproject.toml        # UV dependencies
│   │   ├── docker-compose.yml    # Local development
│   │   └── DAPR_README.md        # Dapr setup guide
│   ├── frontend/                 # Next.js 16+ application
│   │   ├── src/                  # TypeScript source
│   │   │   ├── app/              # App Router routes
│   │   │   ├── components/       # React components
│   │   │   ├── hooks/            # Custom hooks
│   │   │   │   └── useWebSocket.ts    # Real-time updates
│   │   │   └── lib/
│   │   │       └── websocket.ts  # WebSocket client
│   │   ├── Dockerfile            # Multi-stage Docker build
│   │   └── package.json          # Node.js dependencies
│   ├── k8s-dapr/                 # Dapr components for Kubernetes
│   │   ├── components/           # Pub/sub, state store, secrets
│   │   ├── bindings/             # Cron bindings
│   │   └── subscriptions/        # Event subscriptions
│   ├── helm-charts/              # Helm charts for all services
│   │   ├── todo-backend/         # Main backend (with Dapr)
│   │   ├── todo-frontend/        # Frontend (WebSocket support)
│   │   ├── recurring-service/    # Recurring task generator
│   │   ├── notification-service/ # Reminder notifications
│   │   ├── audit-service/        # Audit logging
│   │   └── websocket-service/    # Real-time broadcasts
│   ├── MINIKUBE_STARTUP_GUIDE.md # Minikube + Dapr guide
│   └── docker-compose.yml        # Local development stack
├── specs/                        # Feature specifications
│   ├── 001-cli-todo/             # Command-based CLI spec
│   ├── 002-cli-menu-ui/          # Menu-driven CLI spec (70/70 tasks)
│   ├── 003-nextjs-frontend/      # Next.js web app spec (191 tasks)
│   ├── 004-frontend-auth/        # Authentication spec (complete)
│   ├── 005-fastapi-backend/      # FastAPI backend spec (24 tasks)
│   ├── 007-agents-mcp/           # MCP Agent Integration spec (98 tasks)
│   ├── 008-chatkit-integration/  # ChatKit Integration spec (164 tasks, complete)
│   ├── 009-minikube-deployment/  # Minikube deployment spec (37 tasks, complete)
│   ├── 010-features/             # Advanced task features spec 🆕
│   └── 011-microservices-dapr/   # Microservices + Dapr spec (100 tasks) 🆕
├── history/                      # Development history
│   ├── prompts/                  # Prompt History Records (PHRs)
│   └── adr/                      # Architecture Decision Records
├── .claude/skills/               # Specialized development skills
│   ├── nextjs/                   # Next.js development skill
│   ├── backend/                  # Python Backend skill
│   ├── better-auth/              # Better Auth skill
│   ├── chatkit/                  # ChatKit Integration skill
│   ├── mcp-integration/          # MCP Integration skill
│   ├── neon-db/                  # Neon PostgreSQL skill
│   ├── openai-agents-sdk/        # OpenAI Agents SDK skill
│   ├── ui-design/                # Modern Technical Editorial design
│   ├── ui-animation/             # Framer Motion animations
│   └── minikube-deployment/      # 🆕 Minikube deployment skill
├── GIT_WORKFLOW.md               # Branching strategy
└── CLAUDE.md                     # Development rules & SDD principles
```

## 🌟 Features Implemented

### Phase 1: CLI Todo Applications (Completed ✅)
**Location**: `phase-1/backend/` | **Branches**: `001-cli-todo`, `002-cli-menu-ui`

#### 001-cli-todo: Command-Based CLI
- ✅ **Direct command interface**: `add`, `view`, `update`, `toggle`, `delete`, `help`, `exit`
- ✅ **Python 3.13+**: Modern Python with type hints
- ✅ **SQLModel**: SQLite database with ORM
- ✅ **Pydantic**: Data validation and serialization
- ✅ **Quality**: 100% mypy/ruff compliance

#### 002-cli-menu-ui: Menu-Driven CLI
- ✅ **7-option visual menu** with emoji icons and box-drawing UI
- ✅ **Zero command memorization**: Guided prompts for all operations
- ✅ **Task CRUD**: Add, View, Update, Toggle, Delete with confirmation
- ✅ **Professional appearance**: Colors, box-drawing, real-time feedback
- ✅ **Quality**: 147 tests, 85%+ coverage, comprehensive error handling

### Phase 2: Full-Stack Application (Complete ✅)
**Location**: `phase-2/backend/` + `phase-2/frontend/` | **Branch**: `005-fastapi-backend`

#### ✅ Fully Implemented Features

**Frontend (Next.js 16+):**
- **Project Setup**: Next.js 16+ with TypeScript and Tailwind CSS 4
- **Dependencies**: Better Auth, React Query, Framer Motion, Sonner, Lucide React
- **Design System**: Modern Technical Editorial (cream #F9F7F2, orange #FF6B4A)
- **Typography**: Playfair Display (serif), DM Sans (sans), JetBrains Mono (mono)
- **Folder Structure**: App Router with route groups (auth/dashboard)

**Backend (FastAPI):**
- **UV Package Management**: Python 3.11+ with UV dependency management
- **FastAPI Framework**: Modern async Python backend with proper architecture
- **SQLModel ORM**: Async PostgreSQL with Neon connection pooling
- **JWT Authentication**: Better Auth integration with python-jose
- **API Endpoints**: Complete CRUD operations for tasks and profile

#### 🔐 Authentication System (Complete ✅)
- **Better Auth Integration**: Full JWT token management with HTTP-only cookies
- **User Registration**: Email/password signup with validation
- **User Login**: Secure authentication with session management
- **Password Change**: Profile page with Better Auth password change functionality
- **Session Management**: 7-day sessions with automatic refresh
- **Error Handling**: Duplicate email, invalid credentials, weak password validation
- **Database Schema**: Complete Better Auth tables (user, session, account, verification)

#### 🎨 UI Components & Features
- **20+ Reusable Primitives**: Button, Input, Card, Badge, Dialog, Skeleton, etc.
- **Auth Components**: LoginForm, SignupForm, AuthGuard
- **Profile Components**: ProfileForm, PasswordChangeForm, AccountSettings
- **Task Components**: CategoryBadge, PriorityBadge, EmptyState
- **Layout Components**: Header, Navigation

#### 📊 API & State Management

**Backend API (FastAPI):**
- **Complete Endpoints**:
  - `GET /api/{user_id}/tasks` - List tasks with filtering/sorting
  - `GET /api/{user_id}/tasks/{task_id}` - Get single task
  - `POST /api/{user_id}/tasks` - Create task
  - `PUT /api/{user_id}/tasks/{task_id}` - Update task
  - `PATCH /api/{user_id}/tasks/{task_id}/complete` - Toggle completion
  - `DELETE /api/{user_id}/tasks/{task_id}` - Delete task
  - `GET /api/{user_id}/profile` - User profile and statistics
- **Security**: JWT verification, user ownership enforcement, input validation
- **Database**: Neon PostgreSQL with async operations and connection pooling

**Frontend Integration:**
- **Backend-Agnostic Client**: Error handling and request/response management
- **React Query**: Server state with optimistic updates and caching
- **Auth Hooks**: useSession, useSignIn, useSignUp, useSignOut, useAuth
- **API Layer**: Task CRUD operations with demo mode support

#### ✅ Verification & Quality
- **TypeScript**: No compilation errors (strict mode)
- **Python**: Type-safe with proper async patterns
- **API Testing**: All endpoints verified (24/24 tasks completed)
- **Integration Tests**: Comprehensive backend test suite
- **Database**: Neon PostgreSQL with proper schema, indexes, and connection pooling
- **Security**: JWT verification, user ownership enforcement, error handling, input validation
- **Documentation**: Complete PHRs for all implementation stages

### Phase 5: Microservices with Dapr ✅ **CURRENT** 🆕
**Location**: `phase-5/backend/` + `phase-5/frontend/` | **Branches**: `010-features`, `011-microservices-dapr`

#### Advanced Task Features (Branch 010)
- ✅ **Recurring Tasks**: Daily, weekly, monthly, yearly with end dates
- ✅ **Reminders**: Time-based notifications with timezone support (PKT/UTC+5)
- ✅ **Tags**: JSONB-based tagging system for categorization
- ✅ **Enhanced Task Model**: Extended database schema with new fields

#### Event-Driven Microservices (Branch 011)
- ✅ **6 Microservices**: frontend, backend-api, recurring-service, notification-service, audit-service, websocket-service
- ✅ **Dapr Integration**: Pub/sub, state store, service invocation, cron bindings
- ✅ **Kafka/Redpanda**: Event streaming with 6 topics
- ✅ **Real-Time Updates**: WebSocket + SSE for live synchronization across devices
- ✅ **Automatic Recurring Tasks**: Next occurrence generated on completion
- ✅ **Reminder Notifications**: Cron-based checking every minute
- ✅ **Complete Audit Trail**: All events logged to audit_logs table
- ✅ **Idempotency**: Dapr State Store prevents duplicate event processing
- ✅ **Resilient Operation**: Services fail gracefully without affecting others
- ✅ **Helm Charts**: Complete charts for all 6 services with Dapr sidecars
- ✅ **Docker Compose**: Local development stack with Redpanda

#### 🏗️ Microservices Architecture
```
┌──────────────────────────────────────────────────────────────────────────┐
│                           Next.js Frontend                              │
│                    (Port 3000 - WebSocket + SSE)                         │
└────────────────────────────┬─────────────────────────────────────────────┘
                             │ WebSocket/SSE + API
                             ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                      FastAPI Backend (backend-api)                       │
│                      (Port 8000 - Main Gateway)                          │
│                        ┌─────────────────────┐                           │
│                        │   ChatKit + Agents  │                           │
│                        │   JWT Authentication │                           │
│                        │   Task CRUD         │                           │
│                        └─────────────────────┘                           │
└────────────────────────────┬─────────────────────────────────────────────┘
                             │ Dapr Pub/Sub (Kafka)
                             ▼
        ┌────────────────────┼────────────────────┬─────────────────────┐
        │                    │                    │                     │
┌───────▼──────┐    ┌────────▼────────┐  ┌───────▼──────┐    ┌────────▼────────┐
│   recurring  │    │  notification   │  │    audit     │    │   websocket     │
│   service    │    │     service     │  │   service    │    │    service      │
│  Port 8001   │    │   Port 8002     │  │  Port 8003   │    │   Port 8004     │
│              │    │                 │  │             │    │                 │
│ Next task    │    │ Cron reminders  │  │ Event logs  │    │ Real-time       │
│ generation   │    │ Notifications   │  │             │    │ broadcasts      │
└──────────────┘    └─────────────────┘  └─────────────┘    └─────────────────┘
        │                    │                    │                     │
        └────────────────────┴────────────────────┴─────────────────────┘
                                        │
                                        ▼
                              ┌──────────────────┐
                              │   Neon DB +      │
                              │   Dapr State     │
                              │   (Redis)        │
                              └──────────────────┘
```

#### 🔄 Event System (6 Kafka Topics)

| Topic | Publisher | Subscribers | Purpose |
|-------|-----------|-------------|---------|
| `task-created` | backend-api | audit, websocket, recurring | New task events |
| `task-updated` | backend-api | audit, websocket | Task modifications |
| `task-completed` | backend-api | audit, websocket, recurring | Task completion |
| `task-deleted` | backend-api | audit, websocket | Task deletion |
| `reminder-due` | notification-service | websocket | Reminder notifications |
| `task-updates` | websocket-service | frontend | Aggregated updates |

## 📖 Documentation

### Development Workflow
- **[GIT_WORKFLOW.md](GIT_WORKFLOW.md)** - Complete branching strategy and workflow
- **[CLAUDE.md](CLAUDE.md)** - Development rules and SDD principles
- **[.claude/skills/](.claude/skills/)** - Specialized development skills

### Phase Documentation
- **Phase 1**: **[specs/001-cli-todo/](specs/001-cli-todo/)** & **[specs/002-cli-menu-ui/](specs/002-cli-menu-ui/)**
  - Complete CLI specifications (70/70 tasks completed)
  - **[phase-1/backend/README.md](phase-1/backend/README.md)** - CLI implementation guide
- **Phase 2**: **[specs/003-nextjs-frontend/](specs/003-nextjs-frontend/)** + **[specs/005-fastapi-backend/](specs/005-fastapi-backend/)**
  - **Frontend**: **[spec.md](specs/003-nextjs-frontend/spec.md)** (4 user stories, 191 tasks)
  - **Backend**: **[spec.md](specs/005-fastapi-backend/spec.md)** (5 user stories, 24 tasks)
  - **Architecture**: **[plan.md](specs/005-fastapi-backend/plan.md)** - Full-stack architecture
  - **Implementation**: **[tasks.md](specs/005-fastapi-backend/tasks.md)** - Complete task breakdown
  - **[phase-2/README.md](phase-2/README.md)** - Full-stack documentation

### Current Implementation
- **[phase-2/backend/](phase-2/backend/)** - FastAPI Python backend:
  - **Branch**: `005-fastapi-backend` ✅ Complete
  - **Framework**: FastAPI with async/await patterns
  - **Database**: Neon PostgreSQL with SQLModel ORM
  - **Authentication**: JWT verification with Better Auth secret
  - **API**: Complete CRUD endpoints for tasks and profile
  - **Security**: User ownership enforcement, input validation, error handling
  - **UV Package Manager**: Modern Python dependency management

- **[phase-2/frontend/](phase-2/frontend/)** - Next.js 16+ application:
  - **Branch**: `005-fastapi-backend` ✅ Complete
  - **App Router**: Route groups for auth/dashboard separation
  - **Authentication**: Better Auth with JWT tokens in HTTP-only cookies
  - **Profile Features**: Password change, user settings, account management
  - **State Management**: React Query + React Hook Form
  - **Design System**: Modern Technical Editorial (cream/orange palette)
  - **TypeScript**: Strict mode with full type safety
  - **Styling**: Tailwind CSS 4 with custom fonts
  - **Database**: Neon PostgreSQL with complete Better Auth schema

### CLI Applications (Phase 1)
- **[phase-1/backend/](phase-1/backend/)** - Python CLI with:
  - **001-cli-todo**: Command-based interface
  - **002-cli-menu-ui**: Menu-driven interface
  - **Quality**: 147 tests, 85%+ coverage, mypy/ruff compliance

### Phase 3: MCP Agent Integration (In Progress 🚧)
- **[specs/007-agents-mcp/](specs/007-agents-mcp/)** - Complete specification
  - **Spec**: **[spec.md](specs/007-agents-mcp/spec.md)** (3 user stories, 98 tasks)
  - **Plan**: **[plan.md](specs/007-agents-mcp/plan.md)** - Dual-agent architecture
  - **Implementation**: **[tasks.md](specs/007-agents-mcp/tasks.md)** - Checkpoint-driven tasks
  - **Status**: Backend complete, awaiting Checkpoint 2 approval

- **[phase-3/backend/](phase-3/backend/)** - MCP Agent Backend:
  - **Branch**: `007-agents-mcp` 🚧 In Progress
  - **Framework**: OpenAI Agents SDK + FastAPI + MCP Protocol
  - **Agents**: Dual-agent system (Orchestrator + UrduSpecialist)
  - **MCP Tools**: 5 CRUD operations with user isolation
  - **Database**: Neon PostgreSQL with TaskService layer
  - **Security**: Multi-layer JWT validation and user isolation
  - **Testing**: Comprehensive integration tests (7 test cases)

- **[phase-3/frontend/](phase-3/frontend/)** - Chatbot UI:
  - **Branch**: `007-agents-mcp` 🚧 In Progress
  - **Page**: `/chatbot` with modern chat interface
  - **Components**: Message bubbles, input, chat header, quick actions
  - **Integration**: API proxy route with JWT authentication
  - **Design**: Modern Technical Editorial with animations
  - **Status**: Complete frontend implementation, ChatKit pending

## 🏗️ Architecture

This project follows **Spec-Driven Development** with clear separation:

1. **Specification** (`specs/###-feature/spec.md`) - What to build
2. **Planning** (`specs/###-feature/plan.md`) - How to build it
3. **Tasks** (`specs/###-feature/tasks.md`) - Testable implementation steps
4. **Implementation** - Code in feature branch
5. **Documentation** - PHRs and ADRs in `history/`

## 🚀 Quick Start

### Option 1: ChatKit Integration (Current - Phase 3 Complete)

```bash
# Clone and setup
git clone <repo>
cd hackathon-todo

# Switch to current feature branch
git checkout 005-fastapi-backend

# === SETUP BACKEND ===
cd phase-2/backend

# Install UV (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install Python dependencies
uv sync

# Set up environment variables
cp .env.example .env
# Edit .env with your values (DATABASE_URL and BETTER_AUTH_SECRET required)

# === SETUP FRONTEND ===
cd ../frontend

# Install Node.js dependencies
npm install

# Set up environment variables
cp .env.demo .env.local
# Edit .env.local: Set NEXT_PUBLIC_DEMO_MODE=false, NEXT_PUBLIC_API_URL=http://localhost:8000

# === RUN APPLICATION ===

# Terminal 1: Start FastAPI backend
cd phase-2/backend
uv run uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2: Start Next.js frontend
cd phase-2/frontend
npm run dev
```

**Access the application at `http://localhost:3000`**

You'll see a complete full-stack application with:

**Backend (FastAPI at `http://localhost:8000`):**
- **Complete API**: 8 endpoints for tasks and profile management
- **JWT Authentication**: Better Auth integration with python-jose
- **Database**: Neon PostgreSQL with async operations
- **Security**: User ownership enforcement, input validation, error handling

**Frontend (Next.js at `http://localhost:3000`):**
- **Authentication**: Login, Signup with Better Auth
- **Profile Management**: User settings and password change
- **Task Dashboard**: Full CRUD operations with filtering and sorting
- **Modern Design**: Cream (#F9F7F2) and orange (#FF6B4A) palette
- **Responsive**: Mobile-first design

**Requirements**: Neon PostgreSQL database connection and BETTER_AUTH_SECRET (32+ chars)

### Option 2: CLI Applications (Phase 1)

#### 2a. Menu-Driven CLI (002-cli-menu-ui) - Recommended
```bash
# Switch to menu-driven CLI branch
git checkout 002-cli-menu-ui

# Run the menu-driven CLI application
cd phase-1/backend
uv run backend
```

**Visual menu interface** - Zero command memorization required:
```
╔════════════════════════════════════════════════════════════╗
║                    📋 TODO APPLICATION                     ║
║                    Menu-Driven Interface                   ║
╚════════════════════════════════════════════════════════════╝

┌────────────────────  MAIN MENU  ────────────────────┐
│ 1. 📝 Add New Task                                   │
│ 2. 📋 View All Tasks                                 │
│ 3. ✏️  Update Task                                  │
│ 4. 🔄 Toggle Task Status                             │
│ 5. 🗑️  Delete Task                                  │
│ 6. ❓ Help & Instructions                            │
│ 7. 👋 Exit Application                               │
└─────────────────────────────────────────────────────┘
```

#### 2b. Command-Based CLI (001-cli-todo)
```bash
# Switch to command-based CLI branch
git checkout 001-cli-todo

# Run the command-based CLI application
cd phase-1/backend
uv run backend
```

**Direct command interface** - Use commands like: `add`, `view`, `toggle`, `update`, `delete`, `help`, `exit`

## 🔄 Complete Development History

### Implementation Progress
- ✅ **Phase 1**: CLI Applications (Complete - 70/70 tasks)
  - Command-based CLI (001-cli-todo)
  - Menu-driven CLI (002-cli-menu-ui)
- ✅ **Phase 2**: Full-Stack Application (Complete - 215/215 tasks total)
  - ✅ Next.js Frontend (191/191 tasks) - `004-frontend-auth`
  - ✅ FastAPI Backend (24/24 tasks) - `005-fastapi-backend`
- ✅ **Phase 3**: ChatKit Integration (Complete - 164/164 tasks total)
  - ✅ Agent Foundation (32/32 tasks) - `007-agents-mcp`
  - ✅ ChatKit Integration (164/164 tasks) - `008-chatkit-integration`

### ✅ Completed Features

**Frontend (Next.js):**
1. **Authentication System**: Full Better Auth implementation with JWT tokens
2. **User Registration**: Email/password signup with validation
3. **User Login**: Secure authentication with session management
4. **Profile Management**: User settings and password change functionality
5. **Database Integration**: Neon PostgreSQL with complete Better Auth schema
6. **TypeScript**: Zero compilation errors, strict mode compliance
7. **API Integration**: Ready for backend connection
8. **ChatKit Integration**: Complete OpenAI ChatKit widget with dual-agent support
9. **Modern UI**: Technical Editorial design with cream/orange palette
10. **Responsive Design**: Mobile-first approach with accessibility features

**Backend (FastAPI):**
11. **API Architecture**: Modern async Python with FastAPI
12. **Complete CRUD**: 8 endpoints for tasks and profile
13. **JWT Authentication**: Better Auth integration with python-jose
14. **Database Operations**: SQLModel ORM with Neon PostgreSQL
15. **Security**: User ownership enforcement, input validation, error handling
16. **UV Package Management**: Modern Python dependency management
17. **Integration Tests**: Comprehensive backend verification
18. **ChatKit Server**: Custom ChatKitServer with OpenAI Agents SDK integration
19. **PostgreSQL Store**: Complete store with 14 methods for thread persistence
20. **Dual-Agent System**: Orchestrator + UrduSpecialist with intelligent handoffs
21. **MCP Tools**: 5 CRUD operations via Model Context Protocol

### 🎯 Ready for Production
- **Full-Stack Integration**: Complete ChatKit integration with dual-agent system
- **Complete API**: ChatKit endpoints, MCP tools, and task management endpoints
- **Security**: Multi-layer user isolation, JWT verification, Row Level Security
- **Database**: Neon PostgreSQL with ChatKit tables, indexes, and proper schema
- **Documentation**: Complete PHRs for all implementation stages (449 tasks)
- **Testing**: Comprehensive integration, security, and performance testing
- **Setup**: Automated setup script with environment validation

### 🎯 Current Status: All Phases Complete ✅

**Branch**: `009-minikube-deployment` | **Status**: Local Kubernetes Deployment Ready for Production Cloud 🆕

Phase 4 is now **complete** with full Minikube deployment including Docker containerization, Helm charts, Kubernetes resources, and comprehensive documentation. All 584 tasks across all 4 phases have been completed and tested.

#### Quick Start: Minikube Deployment 🆕
```bash
# Start Minikube
minikube start && eval $(minikube docker-env)

# Create secrets and build images
kubectl create secret generic app-secrets --from-literal=DATABASE_URL='...'
cd phase-4 && docker build -t todo-frontend:v1 ./frontend && docker build -t todo-backend:v1 ./backend

# Deploy
cd helm-charts && helm install backend ./todo-backend && helm install frontend ./todo-frontend

# Start tunnel (in new terminal)
minikube tunnel

# Access: http://127.0.0.1:3000
```

#### Quick Start: Local Development (Phase 3)
```bash
# Setup ChatKit (one-time setup)
cd phase-4/backend
python setup_chatkit.py

# Start backend server
uv run uvicorn backend.main:app --reload

# Start frontend (in separate terminal)
cd phase-4/frontend
npm run dev

# Visit: http://localhost:3000/chatkit
```

#### Available Features
- **Kubernetes Deployment**: Production-like container orchestration
- **Microservices Architecture**: Event-driven with Dapr + Kafka 🆕
- **Real-Time Updates**: WebSocket + SSE for cross-device sync 🆕
- **ChatKit Interface**: Complete OpenAI ChatKit integration with dual-agent support
- **Natural Language Tasks**: "Create a task for tomorrow", "Show my tasks", "میرے ٹاسک دکھاؤ"
- **Thread Persistence**: All conversations saved to PostgreSQL with user isolation
- **MCP Tools**: 5 CRUD operations accessible via natural language
- **Security**: Multi-layer user isolation with JWT + RLS + query filtering

#### Future Roadmap
- **Phase VI**: Production Cloud Deployment (Azure AKS / Google GKE / Oracle OKE) 🆕
- **CI/CD Pipeline**: GitHub Actions automation
- **Monitoring**: Prometheus + Grafana observability stack
- **Service Mesh**: Istio for advanced traffic management

## 🎯 Development Principles

- ✅ **Spec-Driven**: Every feature starts with specs
- ✅ **Sequential Branching**: `001-`, `002-`, `003-`, `004-`, `005-`, `007-`, `008-`, `009-`, `010-`, `011-` pattern
- ✅ **Test-First**: Comprehensive testing at every stage
- ✅ **Documentation**: PHRs for every user interaction
- ✅ **Type Safety**: Full mypy compliance
- ✅ **Quality Gates**: Linting, formatting, coverage

## 📊 Project Metrics

### Overall Progress
- **Phases Completed**: 5/5 (Phase 1 ✅, Phase 2 ✅, Phase 3 ✅, Phase 4 ✅, Phase 5 ✅) 🆕
- **Total Feature Branches**: 11 (`001-`, `002-`, `003-`, `004-`, `005-`, `007-`, `008-`, `009-`, `010-`, `011-`) 🆕
- **Spec-Driven Features**: 11 specifications (all complete) 🆕
- **Total Tasks Completed**: 684+ (100% overall) 🆕

### Phase 1: CLI Applications (Completed ✅)
**Location**: `phase-1/backend/` | **Branches**: `001-cli-todo`, `002-cli-menu-ui`

#### 001-cli-todo: Command-Based CLI
- **Status**: Complete
- **Foundation**: Python 3.13+, SQLModel, Pydantic
- **Features**: Direct command interface with 7 operations
- **Quality**: Type-safe, validated, tested

#### 002-cli-menu-ui: Menu-Driven CLI
- **Tasks**: 70/70 (100% complete)
- **Tests**: 147 total (56 new + 91 existing)
- **Coverage**: 85%+
- **Type Safety**: 100% mypy compliant
- **Code Quality**: 100% ruff compliant
- **Features**: Visual menu, zero command memorization, guided workflows

### Phase 2: Full-Stack Application (Complete ✅)
**Location**: `phase-2/backend/` + `phase-2/frontend/` | **Branch**: `005-fastapi-backend`

#### Completed Status
- **Total Tasks**: 215/215 (100% complete)
- **Frontend Tasks**: 191/191 (100% complete) - `004-frontend-auth`
- **Backend Tasks**: 24/24 (100% complete) - `005-fastapi-backend`
- **Authentication**: Full Better Auth integration with JWT verification
- **Database**: Complete Better Auth schema + Task schema with Neon PostgreSQL
- **Profile Features**: Password change, user settings, account management
- **API**: Complete CRUD endpoints (8 endpoints) with security
- **Verification**: TypeScript compilation, Python type safety, comprehensive testing

### Phase 3: ChatKit Integration ✅ Complete
**Location**: `phase-3/backend/` + `phase-3/frontend/` | **Branch**: `008-chatkit-integration`

#### Completion Status
- **Total Tasks**: 164/164 (100% complete)
- **Phase 3.1**: Agent Foundation - COMPLETE ✅
- **Phase 3.2**: MCP Integration - COMPLETE ✅
- **Phase 3.3**: Frontend Chatbot UI - COMPLETE ✅
- **Phase 3.4**: ChatKit Integration - COMPLETE ✅

#### ✅ Completed Components

**Backend Implementation:**
- **ChatKitServer**: Custom server extending OpenAI ChatKit with Agents SDK integration
- **PostgresChatKitStore**: Complete PostgreSQL store with all 14 required methods
- **Dual-Agent System**: Orchestrator + UrduSpecialist with intelligent handoffs
- **MCP Tools**: 5 CRUD operations (create, list, update, delete, toggle) via MCP protocol
- **Session Management**: OpenAI ChatKit session creation and refresh endpoints
- **User Isolation**: Multi-layer security (JWT + database queries + Row Level Security)
- **Thread Persistence**: Complete chat history storage in PostgreSQL
- **Error Handling**: Comprehensive error handling and validation

**Frontend Implementation:**
- **ChatKitWidget**: Complete React component with OpenAI ChatKit integration
- **Enhanced UI**: Modern Technical Editorial design with cream/orange palette
- **Script Loading**: Enhanced detection using `customElements.whenDefined()`
- **Session Management**: Client-side session handling with JWT authentication
- **Responsive Design**: Mobile-first approach with accessibility features
- **Error States**: User-friendly error messages and loading states
- **API Integration**: Next.js proxy route for secure backend communication

**Database & Security:**
- **ChatKit Tables**: `chatkit_thread` and `chatkit_thread_item` with proper schema
- **Performance Indexes**: Optimized queries for user isolation and pagination
- **Row Level Security**: PostgreSQL RLS policies for multi-tenant security
- **Foreign Keys**: Proper constraints with user deletion cascade

**Testing & Validation:**
- **Integration Tests**: Complete user flow testing (Login → ChatKit → MCP Tools → Logout)
- **Security Tests**: JWT validation, CORS, user isolation verification
- **Performance Tests**: Streaming performance, concurrent sessions, bundle size
- **Setup Script**: Comprehensive `setup_chatkit.py` for environment validation

#### Technology Stack
- **ChatKit**: OpenAI ChatKit v1.5.3 via CDN
- **Agents SDK**: OpenAI Agents SDK 0.6.5+ with Xiaomi mimo-v2-flash model
- **MCP Protocol**: Model Context Protocol for tool integration
- **Backend**: FastAPI with per-request MCP server lifecycle
- **Frontend**: Next.js 16+ App Router with TypeScript
- **Database**: Neon PostgreSQL with async operations and RLS
- **Authentication**: Better Auth with JWT tokens (HTTP-only cookies)

#### Technology Stack (Phase 3)

**Backend (FastAPI):**
- **Framework**: FastAPI with async/await patterns
- **Language**: Python 3.11+ (type-safe)
- **Package Manager**: UV (modern Python dependency management)
- **Database**: Neon PostgreSQL with SQLModel ORM
- **Authentication**: python-jose for JWT verification
- **Security**: User ownership enforcement, input validation, error handling
- **API**: 8 complete endpoints for tasks and profile

**Frontend (Next.js):**
- **Framework**: Next.js 16+ with App Router
- **Language**: TypeScript 5.x (strict mode)
- **Styling**: Tailwind CSS 4
- **Authentication**: Better Auth with JWT tokens (HTTP-only cookies)
- **Database**: Neon PostgreSQL with complete Better Auth schema
- **State Management**: React Query + React Hook Form
- **UI Components**: 20+ reusable primitives
- **Design System**: Modern Technical Editorial (cream/orange palette)
- **API Layer**: Backend-agnostic client ready for FastAPI integration

### Phase 4: Local Kubernetes Deployment (Complete ✅) 🆕
**Location**: `phase-4/backend/` + `phase-4/frontend/` + `phase-4/helm-charts/` | **Branch**: `009-minikube-deployment`

#### Completion Status
- **Total Tasks**: 37/37 (100% complete)
- **Setup Phase**: Minikube, Docker, kubectl, Helm verified ✅
- **Foundational Phase**: Dockerfiles, .dockerignore, images built ✅
- **User Story 1**: Local Kubernetes deployment ✅
- **Rollback & Recovery**: Helm rollback procedures documented ✅
- **Polish**: Troubleshooting, re-deployment, resource docs ✅

#### ✅ Completed Components

**Containerization:**
- **Frontend Dockerfile**: Multi-stage Next.js build (289MB image)
- **Backend Dockerfile**: Multi-stage FastAPI build with uv (200MB image)
- **Dockerignore**: Build exclusions for both services

**Kubernetes Resources:**
- **Helm Charts**: Complete charts for todo-backend and todo-frontend
- **Deployments**: Backend and frontend with health checks
- **Services**: LoadBalancer services with minikube tunnel support
- **Secrets**: app-secrets with DATABASE_URL, API keys, credentials
- **ConfigMaps**: backend-config with HOST, PORT, DEBUG configuration

**Documentation:**
- **MINIKUBE_GUIDE.md**: Complete deployment guide with troubleshooting
- **HELM_OPERATIONS.md**: Rollback procedures, re-deployment workflow, maintenance
- **phase-4/README.md**: Updated with Minikube deployment information

**Testing & Validation:**
- **Helm History**: Verified all deployment versions tracked
- **Rollback Tests**: Confirmed helm rollback works correctly
- **Uninstall/Redeploy**: Verified clean redeployment workflow

#### Technology Stack (Phase 4)
- **Docker**: Multi-stage builds for production images
- **Kubernetes**: Container orchestration with Minikube
- **Helm 3.x**: Package management for deployments
- **LoadBalancer**: External access via minikube tunnel
- **Health Checks**: Liveness and readiness probes

### Phase 5: Microservices with Dapr (Complete ✅) 🆕
**Location**: `phase-5/backend/` + `phase-5/frontend/` + `phase-5/helm-charts/` | **Branches**: `010-features`, `011-microservices-dapr`

#### Completion Status
- **Total Tasks**: 100+ (100% complete)
- **Advanced Features**: Recurring tasks, reminders, tags ✅
- **Microservices**: 6 services with Dapr sidecars ✅
- **Event System**: 6 Kafka topics with pub/sub ✅
- **Real-Time**: WebSocket + SSE for live updates ✅
- **Helm Charts**: Complete charts for all 6 services ✅
- **Docker Compose**: Local development stack ✅

#### ✅ Completed Components

**Advanced Task Features (Branch 010):**
- **Recurring Tasks**: Daily, weekly, monthly, yearly with end dates
- **Reminders**: Time-based notifications with timezone support (PKT/UTC+5)
- **Tags**: JSONB-based tagging system for categorization
- **Enhanced Schema**: Extended task table with new fields

**Microservices Architecture (Branch 011):**
- **6 Services**: frontend (3000), backend-api (8000), recurring-service (8001), notification-service (8002), audit-service (8003), websocket-service (8004)
- **Dapr Integration**: Pub/sub, state store, service invocation, cron bindings
- **Kafka/Redpanda**: Event streaming with 6 topics
- **Idempotency**: Dapr State Store prevents duplicate processing
- **Real-Time Updates**: WebSocket + SSE for cross-device synchronization

**Event System (6 Kafka Topics):**
- `task-created`: Published by backend-api, subscribed by audit, websocket, recurring
- `task-updated`: Published by backend-api, subscribed by audit, websocket
- `task-completed`: Published by backend-api, subscribed by audit, websocket, recurring
- `task-deleted`: Published by backend-api, subscribed by audit, websocket
- `reminder-due`: Published by notification-service, subscribed by websocket
- `task-updates`: Aggregated events for frontend

**Helm Charts (All 6 Services):**
- **todo-backend**: Main API with Dapr sidecar
- **todo-frontend**: Next.js with WebSocket support
- **recurring-service**: Auto-generates next recurring task
- **notification-service**: Cron-based reminder checking
- **audit-service**: Complete event logging
- **websocket-service**: Real-time broadcasts

**Documentation:**
- **DAPR_README.md**: Dapr setup and usage guide
- **MINIKUBE_STARTUP_GUIDE.md**: Minikube + Dapr startup instructions
- **docker-compose.yml**: Local development with Redpanda

#### Technology Stack (Phase 5)
- **Dapr**: Distributed application runtime (v1.15+)
- **Kafka/Redpanda**: Event streaming platform
- **Redis**: Dapr state store for idempotency
- **WebSocket**: Real-time bidirectional communication
- **SSE**: Server-Sent Events for tunnel compatibility
- **Cron Bindings**: Dapr scheduled tasks

### Development Quality Metrics
- **SDD Compliance**: 100% (Spec → Plan → Tasks → Implementation → Documentation)
- **PHR Records**: Comprehensive development history for all phases
- **Skills Integration**: 11 specialized skills (Backend, Better Auth, ChatKit, MCP Integration, Neon DB, Next.js, OpenAI Agents SDK, UI Animation, UI Design, Minikube Deployment, Dapr Integration) 🆕
- **Type Safety**: 100% TypeScript strict mode (Phase 2 frontend), 100% Python type safety (Phase 2 backend), 100% mypy (Phase 1)
- **Code Quality**: 100% ruff compliant (Phase 1), ESLint (Phase 2), Black formatting (Phase 2 backend)
- **Build Verification**: All builds passing
- **Test Coverage**: Comprehensive integration tests for backend

### Documentation & Specs
- **Specifications**: 11 complete (001, 002, 003, 004, 005, 007, 008, 009, 010-features, 011-microservices-dapr) 🆕
- **Plans**: 11 architecture plans 🆕
- **Tasks**: 684+ total tasks (all completed - 100% overall) 🆕
- **PHRs**: Comprehensive development history (all phases documented)
- **ADRs**: Architectural decisions documented

## 🤝 Contributing

This project uses Spec-Driven Development:

1. Create spec with `/sp.specify`
2. Plan architecture with `/sp.plan`
3. Generate tasks with `/sp.tasks`
4. Work on `###-feature-name` branch
5. Create PHRs for each stage
6. Document decisions with ADRs

---

## 🛠️ Technology Stack

### Core Stack (Phase 5 - Current) 🆕
**Location**: `phase-5/backend/` + `phase-5/frontend/` | **Branch**: `011-microservices-dapr` ✅ Complete

- **Next.js 16+** (App Router) - Modern React framework with server components
- **Python FastAPI** - Async Python web framework for high-performance APIs
- **SQLModel** - Type-safe ORM for Python with async support
- **Neon Serverless PostgreSQL** - Cloud-native PostgreSQL database
- **Claude Code + Spec-Kit Plus** - Spec-driven development workflow
- **Better Auth** - Complete authentication solution
- **Dapr** (NEW) - Distributed application runtime for microservices 🆕
- **Kafka/Redpanda** (NEW) - Event-driven messaging system 🆕
- **Redis** (NEW) - State store for idempotency 🆕

### Implementation Details

**Backend (FastAPI):**
- **Framework**: FastAPI with async/await patterns
- **Language**: Python 3.11+ (type-safe)
- **Package Manager**: UV (modern Python dependency management)
- **Database**: Neon PostgreSQL with SQLModel ORM
- **Authentication**: python-jose for JWT verification
- **Security**: User ownership enforcement, input validation, error handling
- **API**: 8 complete endpoints for tasks and profile
- **Testing**: pytest with async support

**Frontend (Next.js):**
- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript 5.x (strict mode)
- **Styling**: Tailwind CSS 4
- **Authentication**: Better Auth with JWT tokens (HTTP-only cookies)
- **State Management**: React Query (TanStack Query) + React Hook Form
- **Animations**: Framer Motion (ready for integration)
- **UI Components**: Lucide React, Sonner (toasts), clsx, tailwind-merge
- **Fonts**: Playfair Display (serif), DM Sans (sans), JetBrains Mono (mono)
- **Design System**: Modern Technical Editorial (cream #F9F7F2, orange #FF6B4A)
- **API Layer**: Backend-agnostic client ready for FastAPI integration

### Phase 1: CLI Applications (Completed)
**Location**: `phase-1/backend/` | **Branches**: `001-cli-todo`, `002-cli-menu-ui`

- **Language**: Python 3.13+
- **Package Manager**: UV
- **Database**: SQLite with SQLModel ORM
- **Validation**: Pydantic
- **Testing**: pytest (147 tests, 85%+ coverage)
- **Quality**: ruff, mypy, Colorama (ANSI colors)
- **UI**: Rich console formatting with box-drawing and colors

## 🎯 Methodology & Principles

**Methodology**: Spec-Driven Development (SDD)
- ✅ Specification → Planning → Tasks → Implementation → Documentation
- ✅ Every user interaction captured in Prompt History Records (PHRs)
- ✅ Architectural decisions documented in ADRs
- ✅ Sequential branching: `001-`, `002-`, `003-`, `004-` pattern

**Quality Standards**:
- ✅ 100% TypeScript strict mode compliance (Phase 2)
- ✅ 100% mypy compliance (Phase 1)
- ✅ 100% SDD process compliance
- ✅ Comprehensive testing at all levels
- ✅ Modern, maintainable, scalable architecture

**Project Status**: **COMPLETE** - Phase 1 ✅, Phase 2 ✅, Phase 3 ✅, Phase 4 ✅, Phase 5 ✅ (684+ tasks, 100%) - Event-Driven Microservices with Dapr Ready for Production Cloud Deployment 🆕