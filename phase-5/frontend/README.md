# Phase 5: Frontend with Real-Time Microservices Updates

Modern Next.js 16+ frontend with real-time WebSocket/SSE updates, connecting to event-driven microservices backend with Dapr. Features live task synchronization across devices, advanced task features (recurring, reminders, tags), and AI-powered chatbot integration.

---

## 🛠️ Technology Stack

### Core Framework
- **Next.js 16+** (App Router) - Modern React framework with server components
- **TypeScript 5.x** - Strict mode for type safety
- **React 19** - Latest React with improved Server Components
- **Tailwind CSS 4** - Utility-first styling

### Real-Time Technologies 🆕
- **WebSocket API** - Bidirectional real-time communication
- **Server-Sent Events (SSE)** - Unidirectional updates for tunnel compatibility
- **Custom WebSocket Hook** - `useWebSocket` for automatic reconnection
- **WebSocket Client** - Utility library for connection management

### State & Data
- **React Query** (TanStack Query) - Server state management
- **React Hook Form** - Form handling with Zod validation
- **Framer Motion** - Animation library
- **Zod** - Schema validation

### Authentication & UI
- **Better Auth** - Complete authentication solution
- **Lucide React** - Icon library
- **Sonner** - Toast notifications
- **Modern Technical Editorial** - Design system (cream #F9F7F2, orange #FF6B4A)

### AI Integration (from Phase 3)
- **OpenAI ChatKit** - Complete ChatKit UI integration via CDN
- **OpenAI Agents SDK** - Dual-agent AI system with Urdu support
- **ChatKit React** - `@openai/chatkit-react` package

---

## 🏗️ Architecture

### Microservices Integration

The frontend connects to 6 backend microservices via Dapr:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Next.js Frontend (Port 3000)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────────┐ │
│  │   Tasks UI   │  │  ChatKit UI  │  │   Real-Time Updates Hook         │ │
│  │              │  │              │  │   (WebSocket + SSE)              │ │
│  └──────────────┘  └──────────────┘  └──────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            ┌──────────────┐ ┌─────────────┐ ┌──────────────┐
            │  HTTP API    │ │  WebSocket  │ │     SSE      │
            │  (Next.js    │ │  (Native)   │ │  (Fallback)  │
            │  Routes)     │ │             │ │             │
            └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
                   │               │               │
                   ▼               ▼               ▼
            ┌─────────────────────────────────────────────────┐
            │              Dapr Sidecar (Port 3500)           │
            │         Service Invocation + Pub/Sub           │
            └─────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┬───────────────────┐
                    ▼               ▼               ▼                   ▼
            ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────────┐
            │backend-  │   │recurring │   │notific-  │   │   websocket  │
            │  api     │   │-service │   │-service │   │   -service   │
            │  :8000   │   │  :8001   │   │  :8002   │   │    :8004     │
            └──────────┘   └──────────┘   └──────────┘   └──────────────┘
```

---

## 📦 Project Structure

```
phase-5/frontend/
├── src/
│   ├── app/                          # App Router routes
│   │   ├── (auth)/                   # Authentication routes
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/              # Protected routes
│   │   │   ├── tasks/                # Main tasks page with WebSocket 🆕
│   │   │   ├── profile/
│   │   │   ├── chatkit/               # ChatKit + Agents page
│   │   │   └── layout.tsx
│   │   ├── api/                      # 🆕 API routes (proxy to backend)
│   │   │   └── [userId]/
│   │   │       └── tasks/route.ts    # Dapr service invocation
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing page
│   │   └── globals.css
│   │
│   ├── components/                   # React components
│   │   ├── auth/                     # Auth components
│   │   │   ├── AuthGuard.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   └── SignupForm.tsx
│   │   ├── tasks/                    # 🆕 Enhanced task components
│   │   │   ├── TaskForm.tsx          # With recurring, reminders, tags
│   │   │   ├── TaskList.tsx           # With real-time updates
│   │   │   ├── TaskItem.tsx
│   │   │   ├── TaskSearch.tsx         # #tag syntax
│   │   │   ├── TaskFilters.tsx
│   │   │   ├── TaskSort.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── PriorityBadge.tsx
│   │   │   ├── CategoryBadge.tsx
│   │   │   └── TagBadge.tsx           # 🆕 Tag display
│   │   ├── chat/                     # ChatKit components
│   │   │   ├── ChatKitWidget.tsx
│   │   │   └── EnhancedChatKitWidget.tsx
│   │   ├── notifications/            # 🆕 Notification components
│   │   │   ├── NotificationPanel.tsx
│   │   │   └── NotificationItem.tsx
│   │   ├── ui/                       # UI primitives (20+)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   └── layout/                   # Layout components
│   │       ├── Header.tsx            # With notification bell 🆕
│   │       └── Footer.tsx
│   │
│   ├── hooks/                        # Custom hooks
│   │   ├── useAuth.ts                # Authentication
│   │   ├── useTasks.ts              # Task CRUD
│   │   ├── useProfile.ts            # Profile data
│   │   ├── useDebounce.ts           # Debounce utility
│   │   └── useWebSocket.ts          # 🆕 Real-time WebSocket/SSE
│   │
│   ├── lib/                          # Utilities & API
│   │   ├── api/
│   │   │   ├── client.ts            # API client with error handling
│   │   │   └── types.ts             # TypeScript types
│   │   ├── auth/
│   │   │   ├── auth.ts              # Better Auth client
│   │   │   └── auth-client.ts        # Auth utilities
│   │   ├── chatkit/                 # ChatKit utilities
│   │   │   └── session.ts           # Session management
│   │   ├── constants.ts             # Design tokens 🆕
│   │   ├── utils.ts                # General utilities
│   │   └── websocket.ts             # 🆕 WebSocket client library
│   │
│   ├── types/                       # TypeScript definitions
│   │   ├── task.ts                  # 🆕 Extended with Phase 5 fields
│   │   ├── notification.ts          # 🆕 Notification types
│   │   ├── auth.ts
│   │   ├── api.ts
│   │   └── user.ts
│   │
│   └── providers/                   # React providers
│       ├── QueryProvider.tsx        # React Query
│       ├── AuthProvider.tsx         # Auth context
│       └── AnimationProvider.tsx    # Framer Motion
│
├── public/                          # Static assets
├── tailwind.config.ts               # Tailwind configuration
├── next.config.ts                   # Next.js config (standalone)
├── tsconfig.json                    # TypeScript config
├── package.json                     # Dependencies
├── .env.local.example               # 🆕 Environment template
└── Dockerfile                       # Multi-stage build
```

---

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended) 🧪

```bash
cd phase-5

# Start all services with Dapr sidecars
docker-compose up -d

# Frontend available at:
# http://localhost:3000

# View logs
docker-compose logs -f frontend
```

---

### Option 2: Local Development

```bash
cd phase-5/frontend

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Edit .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8004
# NEXT_PUBLIC_DEMO_MODE=false
# BETTER_AUTH_SECRET=your-secret
# DATABASE_URL=postgresql://...

# Start development server
npm run dev

# Access: http://localhost:3000
```

---

### Option 3: Minikube + Dapr (Production-Like) ☸️

```bash
# Start Minikube
minikube start
eval $(minikube docker-env)

# Build frontend image
cd phase-5
docker build -t todo-frontend:v1 -f frontend/Dockerfile frontend

# Deploy
cd helm-charts
helm upgrade --install frontend ./todo-frontend \
  --set image.repository=todo-frontend --set image.tag=v1

# Start tunnel (NEW terminal)
minikube tunnel

# Access: http://127.0.0.1:3000
```

---

## 🔧 Environment Variables

### Required Variables

```bash
# Backend API (for direct HTTP calls)
NEXT_PUBLIC_API_URL=http://localhost:8000

# 🆕 WebSocket Service (for real-time updates)
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8004

# Demo mode (set to false for production)
NEXT_PUBLIC_DEMO_MODE=false

# Better Auth Configuration
BETTER_AUTH_SECRET=your-32-char-secret
BETTER_AUTH_URL=http://localhost:3000

# Database (for Better Auth)
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require
```

### For Kubernetes/Docker Compose

```bash
# Backend service name (for internal K8s communication)
BACKEND_URL=http://backend-api-todo-backend:8000

# WebSocket service URL (for external access)
NEXT_PUBLIC_WEBSOCKET_URL=ws://127.0.0.1:8004
```

---

## 🔄 Real-Time Updates 🆕

### WebSocket Integration

**Location**: `src/hooks/useWebSocket.ts`

The frontend uses a custom `useWebSocket` hook for real-time task updates:

```typescript
import { useTaskRealtimeUpdates } from '@/hooks/useWebSocket'

function TasksPage({ userId }: { userId: string }) {
  // Real-time updates for tasks
  useTaskRealtimeUpdates(userId, (event) => {
    // Handle real-time events
    switch (event.type) {
      case 'task-created':
        // Optimistically add task to list
        break
      case 'task-updated':
        // Update task in list
        break
      case 'task-deleted':
        // Remove task from list
        break
    }
  })

  return <TaskList userId={userId} />
}
```

### Features

- **Automatic Reconnection**: Exponential backoff for connection drops
- **SSE Fallback**: Automatically switches to SSE if WebSocket unavailable
- **Heartbeat**: Keeps connection alive with 15s interval
- **Event Filtering**: Only receives events for current user
- **Type Safety**: Full TypeScript support for all events

### Event Types

```typescript
type TaskEvent =
  | { type: 'task-created'; data: Task }
  | { type: 'task-updated'; data: Task }
  | { type: 'task-completed'; data: Task }
  | { type: 'task-deleted'; data: { task_id: string } }
  | { type: 'reminder-due'; data: Notification }
```

### WebSocket Client

**Location**: `src/lib/websocket.ts`

```typescript
import { WebSocketClient } from '@/lib/websocket'

const ws = new WebSocketClient('ws://localhost:8004/ws', {
  userId: 'user-123',
  onMessage: (event) => console.log('Received:', event),
  onError: (error) => console.error('Error:', error),
  autoReconnect: true,
})

ws.connect()
```

---

## 🎨 Advanced Task Features (Phase 5)

### Recurring Tasks

**UI**: Enhanced `TaskForm` component with recurring options

```typescript
// Create recurring task
const recurringTask = {
  title: "Team Standup",
  description: "Daily team sync",
  recurring_rule: "daily",  // daily, weekly, monthly, yearly
  recurring_end_date: "2026-12-31T23:59:59Z",
  due_date: "2026-01-15",
}
```

**How It Works**:
1. User creates recurring task via form
2. Task saved to database with `recurring_rule`
3. When task completed → event published
4. Backend `recurring-service` generates next occurrence
5. Real-time update pushes new task to all connected clients

### Reminders

**UI**: Date/time picker with timezone support

```typescript
const taskWithReminder = {
  title: "Doctor Appointment",
  due_date: "2026-01-20",
  reminder_at: "2026-01-20T09:00:00+05:00",  // PKT timezone
}
```

**Real-Time Notification**:
1. `notification-service` checks every minute
2. Creates notification when reminder due
3. WebSocket broadcasts `reminder-due` event
4. Frontend shows notification bell + toast

### Tags

**UI**: Tag input with comma-separated values

```typescript
const taskWithTags = {
  title: "Project Review",
  tags: ["urgent", "frontend", "sprint-23"],
}
```

**Search**: Use `#tag` syntax in search box
- `#urgent` → Shows all urgent tasks
- `#frontend` → Shows all frontend tasks

---

## 📡 API Integration

### Backend Connection

The frontend connects via two methods:

**1. HTTP API (Traditional)**
```typescript
// lib/api/client.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL

export async function createTask(userId: string, task: TaskInput) {
  const response = await fetch(`${API_BASE}/api/${userId}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(task),
  })
  return response.json()
}
```

**2. Dapr Service Invocation (Kubernetes) 🆕**
```typescript
// app/api/[userId]/tasks/route.ts
const DAPR_HOST = process.env.DAPR_HOST || 'localhost'
const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT || '3500'
const BACKEND_APP = 'backend-api'

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const daprUrl = `http://${DAPR_HOST}:${DAPR_HTTP_PORT}/v1.0/invoke/${BACKEND_APP}/method/api/${params.userId}/tasks`

  const response = await fetch(daprUrl, {
    method: 'GET',
    headers: {
      'dapr-app-id': BACKEND_APP,
    },
  })

  return response.json()
}
```

### React Query Hooks

**Location**: `src/hooks/useTasks.ts`

```typescript
// Fetch tasks
export function useTasks(userId: string, filters?: TaskFilters) {
  return useQuery({
    queryKey: ['tasks', userId, filters],
    queryFn: () => fetchTasks(userId, filters),
    enabled: !!userId,
  })
}

// Create task (with optimistic update)
export function useCreateTask(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (task: TaskInput) => createTask(userId, task),
    onMutate: async (newTask) => {
      // Optimistic update
      await queryClient.cancelQueries(['tasks', userId])
      const previous = queryClient.getQueryData(['tasks', userId])

      queryClient.setQueryData(['tasks', userId], (old: Task[]) => [
        ...old,
        { ...newTask, id: 'temp', created_at: new Date().toISOString() },
      ])

      return { previous }
    },
    onError: (err, newTask, context) => {
      // Rollback on error
      queryClient.setQueryData(['tasks', userId], context.previous)
    },
    onSettled: () => {
      // Refetch from server
      queryClient.invalidateQueries(['tasks', userId])
    },
  })
}
```

---

## 🤖 ChatKit Integration

### ChatKit Page

**Location**: `src/app/chatkit/page.tsx`

Complete OpenAI ChatKit integration with:
- Dual-agent AI system (Orchestrator + UrduSpecialist)
- MCP tool integration (5 CRUD operations)
- Thread persistence (PostgreSQL)
- JWT authentication
- Modern UI with Technical Editorial design

### Natural Language Examples

- "Create a task for tomorrow with high priority"
- "Show me all my pending tasks"
- "میرے ٹاسک دکھاؤ" (Urdu: Show my tasks)
- "Mark task as completed"
- "Delete the meeting task"

---

## 🎨 Design System

### Modern Technical Editorial

**Color Palette:**
- **Background**: Cream `#F9F7F2`
- **Surface**: Darker cream `#F0EBE0`
- **Accent**: Orange `#FF6B4A`
- **Text**: Dark brown `#2A1B12`
- **Borders**: Subtle `#2A1B12/10`

**Typography:**
- **Headings**: Playfair Display (serif)
- **Body**: DM Sans (sans-serif)
- **Labels**: JetBrains Mono (monospace)

**Animation Tokens:**
- **Spring 400/10** - Default spring physics
- **FadeInUp** - Content appearance
- **LineDraw** - Divider animations

---

## 🔔 Notifications 🆕

### Notification Panel

**Location**: `src/components/notifications/NotificationPanel.tsx`

Features:
- Bell icon in header with unread count badge
- Dropdown panel with recent notifications
- Real-time updates via WebSocket
- Mark as read / delete actions

**Real-Time Flow**:
1. `notification-service` creates notification
2. Publishes `reminder-due` event
3. `websocket-service` broadcasts to clients
4. Frontend `useNotificationRealtimeUpdates` hook receives event
5. Shows toast + updates notification bell

---

## 🗄️ Data Models

### Task Type (Extended)

**Location**: `src/types/task.ts`

```typescript
interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  category: 'work' | 'personal' | 'shopping' | 'health' | 'other'
  due_date?: string
  user_id: string
  created_at: string
  updated_at: string

  // Phase 5: Advanced Features
  recurring_rule?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  recurring_end_date?: string
  parent_task_id?: string
  reminder_at?: string
  reminder_sent?: boolean
  tags?: string[]
}
```

### Notification Type 🆕

```typescript
interface Notification {
  id: string
  user_id: string
  message: string
  notification_type: 'reminder' | 'task_created' | 'task_completed'
  read: boolean
  created_at: string
  task_id?: string
}
```

---

## 🧪 Testing

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

### Build Verification

```bash
npm run build
npm start
```

---

## 🔧 Troubleshooting

### WebSocket Connection Issues

```bash
# Check WebSocket service is running
curl http://localhost:8004/health

# Check WebSocket URL in .env.local
echo $NEXT_PUBLIC_WEBSOCKET_URL

# Test WebSocket connection
wscat -c ws://localhost:8004/ws?user_id=test-user
```

### Real-Time Updates Not Working

```bash
# Check browser console for WebSocket errors
# Verify NEXT_PUBLIC_WEBSOCKET_URL is correct
# Check if WebSocket service is healthy

# For Docker Compose:
docker-compose logs websocket-service

# For Minikube:
kubectl logs -l app=websocket-service --tail=50
```

### API Connection Issues

```bash
# Check backend is running
curl http://localhost:8000/health

# Verify NEXT_PUBLIC_API_URL
echo $NEXT_PUBLIC_API_URL

# Check network tab in browser dev tools
```

---

## 📚 Documentation

### Phase 5 Documentation

- **[../README.md](../README.md)** - Phase 5 overview
- **[../DAPR_README.md](../DAPR_README.md)** - Dapr setup guide
- **[../../specs/011-microservices-dapr/](../../specs/011-microservices-dapr/)** - Microservices specification

### API Documentation

Once running, access backend API docs:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🚀 Deployment

### Docker Build

```bash
# Build production image
docker build -t todo-frontend:v1 -f frontend/Dockerfile frontend

# Run container
docker run -p 3000:3000 todo-frontend:v1
```

### Kubernetes with Helm

```bash
# Build image in Minikube
eval $(minikube docker-env)
docker build -t todo-frontend:v1 -f frontend/Dockerfile frontend

# Deploy
helm upgrade --install frontend helm-charts/todo-frontend \
  --set image.repository=todo-frontend \
  --set image.tag=v1 \
  --set websocketUrl=ws://127.0.0.1:8004
```

---

## 🎯 Current Status

**Branch**: `011-microservices-dapr` ✅ Complete
**Features**: Real-time updates + Advanced tasks + ChatKit + Agents
**Overall**: 684+ tasks across all 5 phases (100% complete)

### Phase 5 Completion Summary

**Advanced Features (Branch 010):**
- ✅ Recurring tasks with automatic generation
- ✅ Time-based reminders with timezone support
- ✅ Flexible tagging system
- ✅ Extended task model

**Real-Time Updates (Branch 011):**
- ✅ WebSocket integration for live updates
- ✅ SSE fallback for tunnel compatibility
- ✅ Automatic reconnection with exponential backoff
- ✅ Real-time task synchronization across devices
- ✅ Live notification delivery
- ✅ Optimistic UI updates

**Frontend Integration:**
- ✅ Dapr service invocation via API routes
- ✅ Enhanced TaskForm with Phase 5 fields
- ✅ Real-time notification panel
- ✅ #tag search syntax
- ✅ Modern UI with Technical Editorial design

---

**Project**: Phase 5 - Frontend with Real-Time Microservices Updates
**Branch**: `011-microservices-dapr`
**Framework**: Next.js 16+ + React 19 + TypeScript 5 + WebSocket + SSE + Tailwind CSS 4
**Status**: ✅ **Complete - Production-Ready**

### Complete Feature Set
- ✅ Real-time WebSocket + SSE updates
- ✅ Cross-device task synchronization
- ✅ Advanced task features (recurring, reminders, tags)
- ✅ Live notification delivery
- ✅ ChatKit + Agents SDK integration
- ✅ Dual-agent AI system (Orchestrator + UrduSpecialist)
- ✅ MCP tool integration (5 CRUD operations)
- ✅ Modern Technical Editorial design
- ✅ Better Auth with JWT
- ✅ React Query for state management
- ✅ Dapr service invocation
- ✅ Optimistic updates
- ✅ TypeScript strict mode

This frontend demonstrates a modern, real-time user interface connecting to event-driven microservices backend with live synchronization across devices.
