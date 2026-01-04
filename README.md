# Hackathon Todo Project

A Spec-Driven Development (SDD) project demonstrating a complete full-stack application with modern technology stack:

## 🛠️ Core Technology Stack

- **Next.js 16+** (App Router) - Modern React framework with server components
- **Python FastAPI** - Async Python web framework for high-performance APIs
- **SQLModel** - Type-safe ORM for Python with async support
- **Neon Serverless PostgreSQL** - Cloud-native PostgreSQL database
- **Claude Code + Spec-Kit Plus** - Spec-driven development workflow
- **Better Auth** - Complete authentication solution

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

## 🚀 Current Status

- **Current Branch**: `005-fastapi-backend` ✅ Complete
- **Current Location**: `phase-2/backend/` (FastAPI backend) + `phase-2/frontend/` (Next.js 16+ application)
- **Previous Work**: `phase-1/backend/` (CLI implementations)
- **Base Branch**: `main` (stable)
- **Status**: ✅ **Full-stack application complete - FastAPI backend + Next.js frontend with authentication**

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
├── specs/                        # Feature specifications
│   ├── 001-cli-todo/             # Command-based CLI spec
│   ├── 002-cli-menu-ui/          # Menu-driven CLI spec (70/70 tasks)
│   ├── 003-nextjs-frontend/      # Next.js web app spec (191 tasks)
│   ├── 004-frontend-auth/        # Authentication spec (complete)
│   └── 005-fastapi-backend/      # FastAPI backend spec (24 tasks)
├── history/                      # Development history
│   ├── prompts/                  # Prompt History Records (PHRs)
│   └── adr/                      # Architecture Decision Records
├── .claude/skills/               # Specialized development skills
│   ├── nextjs/                   # Next.js development skill
│   ├── ui-design/                # Modern Technical Editorial design
│   └── ui-animation/             # Framer Motion animations
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

## 🏗️ Architecture

This project follows **Spec-Driven Development** with clear separation:

1. **Specification** (`specs/###-feature/spec.md`) - What to build
2. **Planning** (`specs/###-feature/plan.md`) - How to build it
3. **Tasks** (`specs/###-feature/tasks.md`) - Testable implementation steps
4. **Implementation** - Code in feature branch
5. **Documentation** - PHRs and ADRs in `history/`

## 🚀 Quick Start

### Option 1: Full-Stack Application (Current - Phase 2)

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

## 🔄 Current Development: Full-Stack Application (Phase 2 Complete)

### Implementation Progress
- ✅ **Phase 1**: CLI Applications (Complete - 70/70 tasks)
  - Command-based CLI (001-cli-todo)
  - Menu-driven CLI (002-cli-menu-ui)
- ✅ **Phase 2**: Full-Stack Application (Complete - 215/215 tasks total)
  - ✅ Next.js Frontend (191/191 tasks) - `004-frontend-auth`
  - ✅ FastAPI Backend (24/24 tasks) - `005-fastapi-backend`

### ✅ Completed Features

**Frontend (Next.js):**
1. **Authentication System**: Full Better Auth implementation with JWT tokens
2. **User Registration**: Email/password signup with validation
3. **User Login**: Secure authentication with session management
4. **Profile Management**: User settings and password change functionality
5. **Database Integration**: Neon PostgreSQL with complete Better Auth schema
6. **TypeScript**: Zero compilation errors, strict mode compliance
7. **API Integration**: Ready for backend connection

**Backend (FastAPI):**
8. **API Architecture**: Modern async Python with FastAPI
9. **Complete CRUD**: 8 endpoints for tasks and profile
10. **JWT Authentication**: Better Auth integration with python-jose
11. **Database Operations**: SQLModel ORM with Neon PostgreSQL
12. **Security**: User ownership enforcement, input validation, error handling
13. **UV Package Management**: Modern Python dependency management
14. **Integration Tests**: Comprehensive backend verification

### 🎯 Ready for Production
- **Full-Stack Integration**: Frontend ready to connect to backend
- **Complete API**: All endpoints implemented and tested
- **Security**: JWT verification, user ownership, input validation
- **Database**: Neon PostgreSQL with proper schema and indexes
- **Documentation**: Complete PHRs for all implementation stages

### Future Roadmap (After Phase 2)
- **Phase 3**: MCP protocol integration for AI agents
- **Phase 4**: Advanced multi-tenant authentication
- **Phase 5**: React Native mobile application
- **Phase 6**: Real-time features with WebSockets

## 🎯 Development Principles

- ✅ **Spec-Driven**: Every feature starts with specs
- ✅ **Sequential Branching**: `001-`, `002-`, `003-` pattern
- ✅ **Test-First**: Comprehensive testing at every stage
- ✅ **Documentation**: PHRs for every user interaction
- ✅ **Type Safety**: Full mypy compliance
- ✅ **Quality Gates**: Linting, formatting, coverage

## 📊 Project Metrics

### Overall Progress
- **Phases Completed**: 2/2 (Phase 1 complete, Phase 2 complete)
- **Total Feature Branches**: 5 (`001-`, `002-`, `003-`, `004-`, `005-`)
- **Spec-Driven Features**: 5 complete specifications
- **Total Tasks Completed**: 285/285 (100% overall)

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

#### Technology Stack

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

### Development Quality Metrics
- **SDD Compliance**: 100% (Spec → Plan → Tasks → Implementation → Documentation)
- **PHR Records**: Comprehensive development history for all phases
- **Skills Integration**: 3 specialized skills (Next.js, UI Design, UI Animation)
- **Type Safety**: 100% TypeScript strict mode (Phase 2 frontend), 100% Python type safety (Phase 2 backend), 100% mypy (Phase 1)
- **Code Quality**: 100% ruff compliant (Phase 1), ESLint (Phase 2), Black formatting (Phase 2 backend)
- **Build Verification**: All builds passing
- **Test Coverage**: Comprehensive integration tests for backend

### Documentation & Specs
- **Specifications**: 5 complete (001, 002, 003, 004, 005)
- **Plans**: 5 architecture plans
- **Tasks**: 285 total tasks (285 completed - 100%)
- **PHRs**: Comprehensive development history (3 recent PHRs)
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

### Core Stack (Phase 2 - Current)
**Location**: `phase-2/backend/` + `phase-2/frontend/` | **Branch**: `005-fastapi-backend` ✅ Complete

- **Next.js 16+** (App Router) - Modern React framework with server components
- **Python FastAPI** - Async Python web framework for high-performance APIs
- **SQLModel** - Type-safe ORM for Python with async support
- **Neon Serverless PostgreSQL** - Cloud-native PostgreSQL database
- **Claude Code + Spec-Kit Plus** - Spec-driven development workflow
- **Better Auth** - Complete authentication solution

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

**Project Status**: **COMPLETE** - Phase 1 ✅, Phase 2 ✅ (285/285 tasks, 100%) - Full-Stack Application Ready for Production