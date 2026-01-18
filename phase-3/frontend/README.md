# ChatKit + Agents + MCP Frontend - Phase 3 Complete

Complete ChatKit integration with OpenAI ChatKit, OpenAI Agents SDK, and MCP Protocol. A modern, TypeScript-based Next.js 16+ frontend application with Better Auth authentication and AI-powered chatbot integration. Features both traditional todo management and conversational task management via dual-agent AI system with full ChatKit UI.

## 🛠️ Technology Stack

- **Next.js 16+** (App Router) - Modern React framework with server components
- **TypeScript 5.x** - Strict mode for type safety
- **Tailwind CSS 4** - Utility-first styling
- **Better Auth** - Complete authentication solution
- **React Query** - Server state management for chat and todos
- **React Hook Form** - Form handling with Zod validation
- **Framer Motion** - Animation library (used for chat animations)
- **Lucide React** - Icon library
- **Sonner** - Toast notifications
- **Modern Technical Editorial** - Design system (cream #F9F7F2, orange #FF6B4A)
- **OpenAI ChatKit** - Complete ChatKit UI integration via CDN
- **OpenAI Agents SDK** - Dual-agent AI system with Urdu support
- **MCP Protocol** - Model Context Protocol for tool integration
- **ChatKit React** - `@openai/chatkit-react` package

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm, yarn, or pnpm
- Access to the FastAPI backend (running on port 8000)

### Installation

```bash
# Navigate to frontend directory
cd phase-3/frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.demo .env.local
```

### Environment Configuration

Create `.env.local` with the following variables:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Demo mode (set to false for production)
NEXT_PUBLIC_DEMO_MODE=false

# Better Auth Configuration
BETTER_AUTH_SECRET=your-32-char-secret-key-here
BETTER_AUTH_URL=http://localhost:3000

# Database URL (for Better Auth)
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run type checking
npm run type-check

# Run linting
npm run lint
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🏗️ Architecture

### Technology Stack

- **Framework**: Next.js 16+ with App Router
- **Language**: TypeScript 5.x (strict mode)
- **Styling**: Tailwind CSS 4
- **Authentication**: Better Auth with JWT tokens
- **State Management**: React Query + React Hook Form
- **UI Components**: 20+ reusable primitives
- **Design System**: Modern Technical Editorial (cream #F9F7F2, orange #FF6B4A)
- **API Layer**: Backend-agnostic client with error handling

### Project Structure

```
phase-3/frontend/
├── src/
│   ├── app/                    # App Router routes
│   │   ├── (auth)/            # Authentication routes
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/       # Protected routes
│   │   │   ├── tasks/
│   │   │   ├── profile/
│   │   │   ├── chatkit/       # NEW: ChatKit Integration page
│   │   │   └── layout.tsx
│   │   ├── layout.tsx         # Root layout (includes ChatKit CDN)
│   │   ├── page.tsx           # Landing page
│   │   └── globals.css
│   ├── components/            # React components
│   │   ├── auth/              # Auth components
│   │   │   ├── AuthGuard.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   └── SignupForm.tsx
│   │   ├── tasks/             # Task components
│   │   │   ├── TaskForm.tsx
│   │   │   ├── TaskSearch.tsx
│   │   │   └── TaskList.tsx
│   │   ├── chat/              # ChatKit components
│   │   │   ├── ChatKitWidget.tsx      # NEW: Complete ChatKit integration
│   │   │   └── EnhancedChatKitWidget.tsx  # Enhanced UI wrapper
│   │   ├── ui/                # UI primitives
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── ... (20+ components)
│   │   └── layout/            # Layout components
│   │       ├── Header.tsx     # Updated with ChatKit link
│   │       └── Navigation.tsx
│   ├── lib/                   # Utilities & API
│   │   ├── api.ts             # API client (updated for ChatKit)
│   │   ├── auth.ts            # Auth utilities
│   │   ├── utils.ts           # General utilities
│   │   ├── date.ts            # Date formatting
│   │   └── chatkit/           # NEW: ChatKit utilities
│   │       └── session.ts     # Session management
│   ├── hooks/                 # Custom hooks
│   │   ├── useAuth.ts         # Authentication hook
│   │   ├── useSession.ts      # Session management
│   │   ├── useTasks.ts        # Task operations
│   │   ├── useProfile.ts      # Profile operations
│   │   └── useDebounce.ts     # Debounce utility
│   ├── types/                 # TypeScript definitions
│   │   ├── auth.ts
│   │   ├── task.ts
│   │   ├── api.ts
│   │   └── user.ts
│   └── providers/             # React providers
│       ├── QueryProvider.tsx  # React Query
│       ├── AuthProvider.tsx   # Auth context
│       └── AnimationProvider.tsx  # Framer Motion
├── public/                    # Static assets
├── tailwind.config.ts         # Tailwind configuration
├── next.config.js             # Next.js config
├── tsconfig.json              # TypeScript config
├── package.json               # Dependencies (includes @openai/chatkit-react)
├── package-lock.json          # Dependency lock file
└── .env.local                 # Environment variables
```

## 🔐 Authentication

### Better Auth Integration

The frontend uses Better Auth for complete authentication management:

- **User Registration**: Email/password signup with validation
- **User Login**: Secure authentication with session management
- **Password Change**: Profile page functionality
- **Session Management**: 7-day sessions with automatic refresh
- **Error Handling**: Duplicate email, invalid credentials, weak password validation

### Authentication Flow

1. **Signup/Login**: User authenticates via Better Auth
2. **JWT Token**: Backend returns JWT token
3. **Storage**: Token stored in HTTP-only cookies
4. **API Calls**: Frontend includes token in Authorization header
5. **Protected Routes**: AuthGuard verifies authentication before allowing access

### Protected Routes

All routes under `(dashboard)` group require authentication:

```tsx
// app/(dashboard)/layout.tsx
import { AuthGuard } from '@/components/auth/AuthGuard'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthGuard>{children}</AuthGuard>
}
```

## 📡 API Integration

### Backend Connection

The frontend connects to the FastAPI backend running on `http://localhost:8000`:

```typescript
// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

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

### Available API Endpoints

**ChatKit Integration:**
- `POST /api/chatkit` - Main ChatKit endpoint (all operations)
- `POST /api/chatkit/session` - Create ChatKit session
- `GET /api/chatkit/health` - ChatKit system health

**Task Management:**
- `GET /api/{user_id}/tasks` - List tasks with filters
- `GET /api/{user_id}/tasks/{task_id}` - Get single task
- `POST /api/{user_id}/tasks` - Create task
- `PUT /api/{user_id}/tasks/{task_id}` - Update task
- `PATCH /api/{user_id}/tasks/{task_id}/complete` - Toggle completion
- `DELETE /api/{user_id}/tasks/{task_id}` - Delete task

**Profile & Stats:**
- `GET /api/{user_id}/profile` - User info and task statistics

### React Query Integration

All API calls use React Query for caching, optimistic updates, and error handling:

```typescript
// hooks/useTasks.ts
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

## 🤖 ChatKit Integration

### ChatKit Features

The Phase 3 frontend includes complete OpenAI ChatKit integration with dual-agent AI system support:

**ChatKit Page** (`/chatkit`):
- **OpenAI ChatKit UI**: Official ChatKit component via CDN
- **Dual-Agent Support**: Orchestrator + UrduSpecialist routing
- **MCP Tool Integration**: 5 CRUD operations accessible via natural language
- **Thread Persistence**: Automatic conversation saving to PostgreSQL
- **Session Management**: Secure JWT-based authentication
- **Modern UI**: Technical Editorial design with cream/orange palette
- **Responsive Design**: Mobile-first approach with accessibility

### ChatKit Components

**ChatKitWidget.tsx**:
- Complete ChatKit integration using `@openai/chatkit-react`
- Enhanced script loading detection using `customElements.whenDefined()`
- Custom fetch interceptor for context injection
- Loading states and error handling UI
- Theme configuration with accent color `#FF6B4A`

**EnhancedChatKitWidget.tsx**:
- Wrapper component with expandable UI
- Feature highlights and quick start prompts
- Start screen configuration with greeting and prompts
- Composer placeholder text customization

### ChatKit API Integration

```typescript
// lib/chatkit/session.ts
export async function createChatKitSession(userId: string) {
  const token = getAuthToken()

  const response = await fetch(`${API_BASE}/api/chatkit/session`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user_id: userId,
      metadata: {
        userInfo: { id: userId, name: userId }
      }
    })
  })

  return response.json()
}

export async function refreshChatKitSession(sessionId: string) {
  // Refresh session logic
}
```

```typescript
// components/chat/ChatKitWidget.tsx
import { ChatKit, useChatKit } from '@openai/chatkit-react'

export function ChatKitWidget() {
  const { control } = useChatKit({
    api: {
      url: '/api/chatkit',  // Next.js proxy handles auth injection
      domainKey: 'local-dev',
    },
    startScreen: {
      greeting: 'Hello! I can help you manage your tasks. What would you like to do?',
      prompts: [
        { label: 'Create a task', prompt: 'I want to create a new task' },
        { label: 'List my tasks', prompt: 'Show me my tasks' },
        { label: 'What can you do?', prompt: 'What capabilities do you have?' },
      ],
    },
    composer: {
      placeholder: 'Ask me to create, list, or update tasks...',
    },
  })

  return <ChatKit control={control} />
}
```

### ChatKit Script Loading

**Enhanced Detection**:
- Uses `customElements.whenDefined()` for reliable detection
- Multiple fallback methods for script loading
- Safety timeout with user-friendly error messages
- Development logging for debugging

**CDN Integration**:
```tsx
// app/layout.tsx
<script
  src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
  strategy="afterInteractive"
  onLoad={() => console.log('ChatKit loaded')}
/>
```

### ChatKit Features

**Thread Persistence**:
- Automatic conversation saving to PostgreSQL
- User isolation with Row Level Security
- Thread metadata storage (title, model, context)
- Cross-device conversation access

**Session Management**:
- Secure JWT-based authentication
- Session creation and refresh endpoints
- HTTP-only cookie storage
- Automatic token refresh

**MCP Tool Integration**:
- **create_task**: Create new task via natural language
- **list_tasks**: Show tasks with filtering
- **update_task**: Modify existing tasks
- **delete_task**: Remove tasks
- **toggle_task**: Mark tasks complete/incomplete

**Dual-Agent System**:
- **Orchestrator**: Routes requests to appropriate agent
- **UrduSpecialist**: Handles Urdu language conversations
- Intelligent handoffs between agents
- Cultural context awareness

### Example ChatKit Flow

```typescript
// 1. User visits /chatkit page
// 2. ChatKitWidget loads OpenAI ChatKit via CDN
// 3. Session created via /api/chatkit/session
// 4. User sends message: "Create a task for tomorrow"
// 5. ChatKit → Backend → Orchestrator → UrduSpecialist
// 6. Agent executes MCP create_task tool
// 7. Task saved to PostgreSQL with user isolation
// 8. Response streamed back to ChatKit UI
// 9. Thread automatically persisted
```

### ChatKit API Endpoints

**Main ChatKit Endpoint** (handles all operations):
```http
POST /api/chatkit
Authorization: Bearer <jwt_token>

# Handles:
# - threads.create, threads.get, threads.list
# - messages.create, messages.list
# - runs.create (with streaming response)
# - All other ChatKit protocol operations
```

**Session Management**:
```http
POST /api/chatkit/session
# Creates OpenAI ChatKit session with JWT auth

GET /api/chatkit/health
# Checks ChatKit system status
```

### ChatKit Configuration

**Theme & Styling**:
```typescript
const { control } = useChatKit({
  api: {
    url: '/api/chatkit',
    domainKey: 'local-dev',
  },
  // Custom theme with accent color
  theme: {
    colors: {
      accent: '#FF6B4A',  // Orange accent
      background: '#F9F7F2', // Cream background
    }
  },
  // Start screen configuration
  startScreen: {
    greeting: 'Hello! I can help you manage your tasks.',
    prompts: [
      { label: 'Create a task', prompt: 'I want to create a new task' },
      { label: 'List my tasks', prompt: 'Show me my tasks' },
      { label: 'Urdu support', prompt: 'میرے ٹاسک دکھاؤ' },
    ],
  },
  // Composer customization
  composer: {
    placeholder: 'Ask me to create, list, or update tasks...',
  },
})
```

### ChatKit Error Handling

**Loading Errors**:
- Script loading timeout detection
- Network connectivity issues
- OpenAI API key validation
- User-friendly error messages with retry options

**Runtime Errors**:
- Session creation failures
- MCP tool execution errors
- Agent routing failures
- Database connection issues

**Recovery Mechanisms**:
- Automatic session refresh
- Retry logic for failed requests
- Graceful degradation with fallback UI
- Detailed error logging in development

## 🎨 Design System

### Modern Technical Editorial

**Color Palette:**
- **Background**: Cream `#F9F7F2`
- **Accent**: Orange `#FF6B4A`
- **Text**: Dark brown `#2A1B12`
- **Borders**: Subtle `#2A1B12/10`

**Typography:**
- **Headings**: Playfair Display (serif)
- **Body**: DM Sans (sans-serif)
- **Labels**: JetBrains Mono (monospace)

**Components:**
- **Buttons**: Technical with subtle hover effects
- **Cards**: Clean with minimal borders
- **Inputs**: Modern with validation states
- **Badges**: Color-coded by priority/category

### UI Components

The project includes 20+ reusable components:

**Authentication:**
- `LoginForm` - Email/password login
- `SignupForm` - User registration
- `AuthGuard` - Route protection

**Task Management:**
- `TaskForm` - Create/edit tasks
- `TaskSearch` - Filter and search
- `TaskList` - Display tasks with stats
- `CategoryBadge` - Color-coded categories
- `PriorityBadge` - Priority indicators

**UI Primitives:**
- `Button` - Primary/secondary variants
- `Input` - Text/email/password fields
- `Card` - Container components
- `Dialog` - Modal dialogs
- `Skeleton` - Loading states
- `Badge` - Status indicators

## 🔄 State Management

### React Query (Server State)

- **Caching**: Automatic query caching
- **Invalidation**: Cache invalidation on mutations
- **Optimistic Updates**: Instant UI updates
- **Background Refetching**: Stale-while-revalidate

### React Hook Form (Client State)

- **Form Validation**: Zod schema validation
- **Error Handling**: Field-level error messages
- **Performance**: Minimal re-renders
- **Type Safety**: Full TypeScript support

### Auth Context

- **Session Management**: Automatic token refresh
- **User State**: Current user information
- **Loading States**: Auth loading indicators
- **Error Handling**: Auth error management

## 🔒 Security Features

### Frontend Security

- **JWT Storage**: HTTP-only cookies (not localStorage)
- **Input Validation**: Client-side validation before API calls
- **Error Sanitization**: No sensitive data in error messages
- **CSRF Protection**: SameSite cookies, secure headers
- **XSS Prevention**: React's built-in XSS protection

### API Security

- **Authentication**: JWT verification on every request
- **Authorization**: User ownership enforcement
- **Input Validation**: Server-side validation
- **Rate Limiting**: Ready for implementation
- **CORS**: Configured for trusted origins

## 🧪 Testing & Quality

### Development Workflow

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format

# Build verification
npm run build
```

### Code Quality

- **TypeScript**: Strict mode with no compilation errors
- **ESLint**: Code quality and best practices
- **Prettier**: Consistent code formatting
- **Tailwind**: Utility-first CSS with proper class sorting

## 🚀 Deployment

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Variables for Production

```bash
# Required
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_DEMO_MODE=false
BETTER_AUTH_SECRET=your-production-secret
DATABASE_URL=your-production-db-url

# Optional
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

### Deployment Platforms

**Vercel (Recommended):**
```bash
vercel --prod
```

**Docker:**
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

## 📊 Performance Optimization

### Next.js Optimizations

- **Image Optimization**: Automatic image optimization
- **Font Optimization**: `next/font` for automatic font loading
- **Code Splitting**: Automatic route-based splitting
- **Lazy Loading**: Component and image lazy loading
- **Caching**: ISR and SSG where appropriate

### React Query Optimizations

- **Stale Time**: Configured for optimal cache usage
- **Refetching**: Background refetching on window focus
- **Retry Logic**: Exponential backoff for failed requests
- **Garbage Collection**: Automatic cache cleanup

## 🔧 Troubleshooting

### Common Issues

**1. API Connection Failed**
```bash
# Check backend is running
curl http://localhost:8000/health

# Verify NEXT_PUBLIC_API_URL in .env.local
echo $NEXT_PUBLIC_API_URL
```

**2. Authentication Errors**
- Ensure BETTER_AUTH_SECRET is set (32+ characters)
- Verify DATABASE_URL connection
- Check cookies are enabled in browser

**3. Build Errors**
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

**4. Tailwind Not Working**
```bash
# Restart dev server
npm run dev -- --force
```

## 📚 Additional Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Better Auth Docs**: https://better-auth.com
- **React Query Docs**: https://tanstack.com/query/latest
- **Tailwind Docs**: https://tailwindcss.com/docs
- **TypeScript Docs**: https://www.typescriptlang.org/docs

## 🤝 Contributing

This project follows Spec-Driven Development principles:

1. **Specification**: Features defined in `specs/003-nextjs-frontend/spec.md`
2. **Planning**: Architecture in `specs/003-nextjs-frontend/plan.md`
3. **Tasks**: Implementation steps in `specs/003-nextjs-frontend/tasks.md`
4. **Documentation**: PHRs in `history/prompts/`

### Development Workflow

```bash
# 1. Check current tasks
cat specs/003-nextjs-frontend/tasks.md

# 2. Work on specific task
# 3. Update task status to [X]
# 4. Create PHR for the work
# 5. Submit PR with documentation
```

## 🎯 Current Status

**Branch**: `008-chatkit-integration` ✅ Complete
**Tasks**: 164/164 (100% complete)
**Status**: ✅ **Phase 3 Complete - ChatKit + Agents + MCP Ready for Production**

### Completed Features

- ✅ **ChatKit Integration**: Complete OpenAI ChatKit UI via CDN
- ✅ **OpenAI ChatKit React**: `@openai/chatkit-react` package integration
- ✅ **Dual-Agent System**: Orchestrator + UrduSpecialist support
- ✅ **MCP Tool Integration**: 5 CRUD operations via natural language
- ✅ **Thread Persistence**: Automatic PostgreSQL storage
- ✅ **Session Management**: JWT-based authentication with secure cookies
- ✅ **Modern UI**: Technical Editorial design (cream #F9F7F2, orange #FF6B4A)
- ✅ **Enhanced Script Loading**: Multiple detection methods with fallbacks
- ✅ **Error Handling**: Comprehensive error states and recovery
- ✅ **Responsive Design**: Mobile-first approach with accessibility
- ✅ **20+ UI Components**: Reusable primitives
- ✅ **TypeScript Strict Mode**: Zero compilation errors
- ✅ **React Query Integration**: Server state management
- ✅ **Better Auth Integration**: Complete authentication system
- ✅ **API Proxy Route**: Secure backend communication

### ChatKit Features

**Components:**
- ✅ `ChatKitWidget.tsx` - Complete ChatKit integration
- ✅ `EnhancedChatKitWidget.tsx` - Enhanced UI wrapper
- ✅ `app/chatkit/page.tsx` - Dedicated ChatKit page
- ✅ `lib/chatkit/session.ts` - Session utilities
- ✅ `app/api/chatkit/route.ts` - Proxy endpoint

**Configuration:**
- ✅ ChatKit CDN script in HTML body (afterInteractive)
- ✅ Enhanced detection using `customElements.whenDefined()`
- ✅ Theme configuration with accent color `#FF6B4A`
- ✅ Start screen with greeting and prompts
- ✅ Composer placeholder customization
- ✅ Loading states and error handling UI

### Quick Start

```bash
# Install dependencies
cd phase-3/frontend
npm install

# Setup environment
cp .env.demo .env.local
# Set NEXT_PUBLIC_DEMO_MODE=false

# Start development server
npm run dev

# Visit: http://localhost:3000/chatkit
```

### Available Features

**ChatKit Interface:**
- **Natural Language Tasks**: "Create a task for tomorrow", "Show my tasks", "میرے ٹاسک دکھاؤ"
- **Thread Persistence**: All conversations saved to PostgreSQL
- **Dual-Agent Routing**: Intelligent handoffs between agents
- **MCP Tools**: 5 CRUD operations accessible via chat
- **Session Management**: Secure JWT-based authentication
- **Responsive UI**: Mobile-first design with accessibility

**Traditional Todo Management:**
- **Task CRUD**: Create, read, update, delete tasks
- **Filtering & Search**: Advanced task filtering
- **Profile Management**: User settings and password change
- **Authentication**: Better Auth with JWT tokens

---

**Project**: ChatKit + Agents + MCP Integration - Phase 3
**Branch**: `008-chatkit-integration`
**Framework**: Next.js 16+ with OpenAI ChatKit
**Status**: ✅ Complete - Ready for Production