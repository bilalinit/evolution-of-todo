# Phase 3 - Full-Stack Todo Application with AI Agent Integration

A complete full-stack todo application built with a modern technology stack:

## 🛠️ Technology Stack

- **Next.js 16+** (App Router) - Modern React framework with server components
- **Python FastAPI** - Async Python web framework for high-performance APIs
- **SQLModel** - Type-safe ORM for Python with async support
- **Neon Serverless PostgreSQL** - Cloud-native PostgreSQL database
- **Claude Code + Spec-Kit Plus** - Spec-driven development workflow
- **Better Auth** - Complete authentication solution

## 🎯 Overview

This phase contains a production-ready full-stack application:

**Backend (FastAPI)**: Modern async Python API with JWT authentication
**Frontend (Next.js)**: React-based web application with Better Auth integration

## 🏗️ Project Structure

```
phase-3/
├── backend/                      # FastAPI Python backend
│   ├── src/backend/
│   │   ├── main.py              # FastAPI app entry
│   │   ├── routes/              # API endpoints (tasks, profile)
│   │   ├── models/              # SQLModel entities
│   │   ├── auth/                # JWT verification
│   │   ├── middleware/          # Auth middleware
│   │   ├── database.py          # PostgreSQL connection
│   │   └── config.py            # Environment config
│   ├── pyproject.toml           # UV dependencies
│   ├── uv.lock                  # Lock file
│   ├── scripts/                 # Test & utility scripts
│   └── README.md                # Backend documentation
│
├── frontend/                     # Next.js 16+ frontend
│   ├── src/
│   │   ├── app/                 # App Router routes
│   │   │   ├── (auth)/          # Login/Signup pages
│   │   │   ├── (dashboard)/     # Protected routes
│   │   │   └── layout.tsx       # Root layout
│   │   ├── components/          # React components
│   │   │   ├── auth/            # Auth components
│   │   │   ├── tasks/           # Task components
│   │   │   ├── ui/              # UI primitives (20+)
│   │   │   └── layout/          # Layout components
│   │   ├── lib/                 # API client & utilities
│   │   ├── hooks/               # Custom hooks
│   │   ├── types/               # TypeScript definitions
│   │   └── providers/           # React providers
│   ├── public/                  # Static assets
│   ├── tailwind.config.ts       # Design system
│   ├── package.json             # Node dependencies
│   └── README.md                # Frontend documentation
│
└── README.md                     # This file (full-stack overview)
```

## 🚀 Quick Start (Full-Stack)

### Prerequisites
- **Node.js 18+** (for frontend)
- **Python 3.11+** (for backend)
- **UV package manager** (for backend)
- **Neon PostgreSQL database** (shared)

### Step 1: Setup Backend

```bash
# Navigate to backend
cd phase-3/backend

# Install UV (if not already)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install Python dependencies
uv sync

# Create environment file
cp .env.example .env

# Edit .env with your values:
# DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require
# BETTER_AUTH_SECRET=your-32-char-secret
# PORT=8000
# XIAOMI_API_KEY=your_xiaomi_api_key_here
# MCP_SERVER_TIMEOUT=30
```

### Step 2: Setup Frontend

```bash
# Navigate to frontend
cd phase-3/frontend

# Install Node dependencies
npm install

# Create environment file
cp .env.demo .env.local

# Edit .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_DEMO_MODE=false
# BETTER_AUTH_SECRET=your-32-char-secret (same as backend)
# DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require
```

### Step 3: Run Both Applications

**Terminal 1 - Backend:**
```bash
cd phase-3/backend
uv run uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Frontend:**
```bash
cd phase-3/frontend
npm run dev
```

### Step 4: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

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

## 📡 API Integration

### Backend Endpoints

**Task Management:**
- `GET /api/{user_id}/tasks` - List with filters (status, priority, category, search)
- `GET /api/{user_id}/tasks/{task_id}` - Get single task
- `POST /api/{user_id}/tasks` - Create task
- `PUT /api/{user_id}/tasks/{task_id}` - Update task
- `PATCH /api/{user_id}/tasks/{task_id}/complete` - Toggle completion
- `DELETE /api/{user_id}/tasks/{task_id}` - Delete task

**Profile & Stats:**
- `GET /api/{user_id}/profile` - User info and task statistics

**System:**
- `GET /health` - Health check
- `GET /` - API information

### Frontend API Client

```typescript
// frontend/lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken() // From cookies

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  return response.json()
}
```

### React Query Integration

```typescript
// frontend/hooks/useTasks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useTasks(userId: string) {
  return useQuery({
    queryKey: ['tasks', userId],
    queryFn: () => apiRequest(`/api/${userId}/tasks`),
    enabled: !!userId,
  })
}

export function useCreateTask(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskData) =>
      apiRequest(`/api/${userId}/tasks`, {
        method: 'POST',
        body: JSON.stringify(taskData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks', userId])
    },
  })
}
```

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

## 🗄️ Database Schema

### Shared Database

Both applications connect to the same Neon PostgreSQL database:

```sql
-- Task table (created by backend)
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

-- Indexes for performance
CREATE INDEX idx_task_user_id ON task(user_id);
CREATE INDEX idx_task_completed ON task(completed);

-- Better Auth tables (created by frontend)
-- user, session, account, verification tables
```

## 🔒 Security Features

### Authentication & Authorization

- **JWT Verification**: Every API request validates token signature
- **User Ownership**: All queries include `WHERE user_id = ?`
- **Zero-Trust**: No trust between requests, verify on every call
- **Proper Status Codes**: 401 (unauthorized), 403 (forbidden), 404 (not found)

### Input Validation

- **Backend**: Pydantic models with type constraints
- **Frontend**: React Hook Form with Zod validation
- **Error Handling**: Detailed error messages, no sensitive data leaks

### Storage Security

- **JWT Tokens**: HTTP-only cookies (not localStorage)
- **Database**: Neon PostgreSQL with SSL required
- **Secrets**: Environment variables, never hardcoded

## 🧪 Testing & Verification

### Backend Tests

```bash
# Basic verification
cd phase-2/backend
uv run python scripts/test_backend.py

# Integration tests
uv run python scripts/integration_test.py

# Pytest suite
uv run pytest -v
```

### Frontend Verification

```bash
cd phase-2/frontend
npm run type-check  # TypeScript compilation
npm run lint        # ESLint checks
npm run build       # Production build
```

### Manual Testing

1. **Start both applications** (see Quick Start)
2. **Open browser**: http://localhost:3000
3. **Register account**: Use signup form
4. **Login**: Verify JWT token in cookies
5. **Create task**: Should appear in database
6. **Test CRUD**: Update, toggle, delete tasks
7. **Check profile**: View task statistics

## 🚀 Deployment

### Production Setup

**Backend Environment:**
```bash
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require"
BETTER_AUTH_SECRET="production-secret-32+chars"
HOST=0.0.0.0
PORT=8000
DEBUG=false
CORS_ORIGINS='["https://yourdomain.com"]'
```

**Frontend Environment:**
```bash
NEXT_PUBLIC_API_URL="https://api.yourdomain.com"
NEXT_PUBLIC_DEMO_MODE=false
BETTER_AUTH_SECRET="production-secret-32+chars"
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require"
```

### Running in Production

**Backend:**
```bash
cd phase-2/backend
uv run uvicorn backend.main:app --host 0.0.0.0 --port 8000 --workers 4
```

**Frontend:**
```bash
cd phase-2/frontend
npm run build
npm start
```

### Docker Deployment

**Backend Dockerfile:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.cargo/bin:$PATH"
COPY pyproject.toml uv.lock ./
COPY src/ ./src/
RUN uv sync --frozen
EXPOSE 8000
CMD ["uv", "run", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Architecture Overview

### Request Flow

```
User → Frontend (Next.js:3000) → JWT Token → Backend (FastAPI:8000)
       ↓                                      ↓
   React Query                        SQLModel ORM
   UI Components                      PostgreSQL
   Design System                      JWT Verification
```

### Data Flow

1. **Authentication**: Better Auth → JWT → HTTP-only cookies
2. **Task Operations**: Frontend hooks → API client → Backend routes
3. **Database**: Backend → SQLModel → Neon PostgreSQL
4. **Response**: Backend → JSON → React Query → UI Update

## 🔧 Troubleshooting

### Common Issues

**1. API Connection Failed**
```bash
# Check backend is running
curl http://localhost:8000/health

# Verify NEXT_PUBLIC_API_URL
echo $NEXT_PUBLIC_API_URL
```

**2. Authentication Errors**
- Ensure `BETTER_AUTH_SECRET` matches in both .env files
- Check `DATABASE_URL` format and SSL mode
- Verify cookies are enabled in browser

**3. Database Connection**
```bash
# Test database connection
cd phase-2/backend
uv run python -c "from backend.database import engine; print('DB OK')"
```

**4. CORS Issues**
- Ensure `CORS_ORIGINS` includes frontend URL
- No trailing slashes in origins
- Check browser console for specific errors

## 📚 Documentation

### Phase 2 Documentation

**Specifications:**
- **Backend**: `specs/005-fastapi-backend/spec.md` (5 user stories, 24 tasks)
- **Frontend**: `specs/003-nextjs-frontend/spec.md` (4 user stories, 191 tasks)

**Architecture:**
- **Backend Plan**: `specs/005-fastapi-backend/plan.md`
- **Frontend Plan**: `specs/003-nextjs-frontend/plan.md`

**Implementation:**
- **Backend Tasks**: `specs/005-fastapi-backend/tasks.md` (24/24 ✅)
- **Frontend Tasks**: `specs/003-nextjs-frontend/tasks.md` (191/191 ✅)

**Documentation:**
- **PHRs**: `history/prompts/` (comprehensive development history)
- **Backend README**: `phase-2/backend/README.md`
- **Frontend README**: `phase-2/frontend/README.md`

## 🎯 Current Status

**Branch**: `005-fastapi-backend` ✅ Complete
**Total Tasks**: 215/215 (100% complete)
**Status**: ✅ **Production Ready**

### Backend (24/24 tasks)
- ✅ FastAPI application setup
- ✅ UV package management
- ✅ SQLModel ORM with Neon PostgreSQL
- ✅ JWT authentication integration
- ✅ Complete CRUD API (8 endpoints)
- ✅ User ownership enforcement
- ✅ Input validation and error handling
- ✅ Comprehensive testing suite
- ✅ Security features (CORS, auth, validation)
- ✅ Database connection pooling

### Frontend (191/191 tasks)
- ✅ Next.js 16+ with App Router
- ✅ Better Auth integration
- ✅ Complete authentication flow
- ✅ Profile management with password change
- ✅ 20+ reusable UI components
- ✅ Modern Technical Editorial design system
- ✅ TypeScript strict mode compliance
- ✅ React Query integration
- ✅ API client with error handling
- ✅ Protected routes with AuthGuard

### Integration
- ✅ Shared database (Neon PostgreSQL)
- ✅ JWT token compatibility
- ✅ CORS configuration
- ✅ API endpoint mapping
- ✅ Environment variable alignment

## 🚀 Ready for Production

### What's Included

**Backend:**
- 8 RESTful endpoints with full CRUD
- JWT authentication with Better Auth compatibility
- Async PostgreSQL operations with connection pooling
- Input validation and comprehensive error handling
- Automatic OpenAPI documentation

**Frontend:**
- Complete authentication system (signup, login, logout)
- Task management with filtering and search
- Profile page with statistics and password change
- Modern design system with 20+ components
- React Query for optimal performance

**Security:**
- JWT verification on every request
- User ownership enforcement
- Input validation (client + server)
- HTTP-only cookie storage
- CORS protection

### Next Steps

1. **Integration Testing**: Test full user flow with real backend
2. **Performance**: Monitor and optimize query performance
3. **Monitoring**: Add error tracking and analytics
4. **Deployment**: Deploy backend and frontend to production
5. **Scaling**: Add rate limiting and caching as needed

---

**Project**: Todo Full-Stack Application
**Phase**: 2 (Complete ✅)
**Architecture**: FastAPI + Next.js 16+
**Status**: 🎉 **Ready for Production**

This application demonstrates a complete modern full-stack architecture with proper separation of concerns, security best practices, and excellent developer experience.