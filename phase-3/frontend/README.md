# Todo Frontend - Next.js 16+ Application with AI Agent Integration

A modern, TypeScript-based Next.js 16+ frontend application with Better Auth authentication and AI-powered chatbot integration. Features both traditional todo management and conversational task management via dual-agent AI system.

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
- **MCP Agent Integration** - Dual-agent AI system with Urdu support

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
│   │   │   ├── chatbot/       # NEW: AI Chatbot page
│   │   │   └── layout.tsx
│   │   ├── layout.tsx         # Root layout
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
│   │   ├── chat/              # NEW: Chat components
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   ├── ChatHeader.tsx
│   │   │   └── QuickActions.tsx
│   │   ├── ui/                # UI primitives
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── ... (20+ components)
│   │   └── layout/            # Layout components
│   │       ├── Header.tsx     # Updated with chatbot link
│   │       └── Navigation.tsx
│   ├── lib/                   # Utilities & API
│   │   ├── api.ts             # API client (updated for chat)
│   │   ├── auth.ts            # Auth utilities
│   │   ├── utils.ts           # General utilities
│   │   └── date.ts            # Date formatting
│   ├── hooks/                 # Custom hooks
│   │   ├── useAuth.ts         # Authentication hook
│   │   ├── useSession.ts      # Session management
│   │   ├── useTasks.ts        # Task operations
│   │   ├── useProfile.ts      # Profile operations
│   │   └── useChat.ts         # NEW: Chat operations
│   ├── types/                 # TypeScript definitions
│   │   ├── auth.ts
│   │   ├── task.ts
│   │   ├── api.ts
│   │   └── chat.ts            # NEW: Chat types
│   └── providers/             # React providers
│       ├── QueryProvider.tsx  # React Query
│       └── AuthProvider.tsx   # Auth context
├── public/                    # Static assets
├── tailwind.config.ts         # Tailwind configuration
├── next.config.js             # Next.js config
├── tsconfig.json              # TypeScript config
└── package.json               # Dependencies
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

## 🤖 AI Chatbot Integration

### Chatbot Features

The Phase 3 frontend includes a complete AI-powered chatbot interface with dual-agent support:

**Chatbot Page** (`/chatbot`):
- **Real-time Messaging**: Send messages to AI agents
- **Dual-Agent Display**: Visual distinction between Orchestrator and UrduSpecialist
- **Tool Call Visualization**: See MCP tools being executed in real-time
- **Quick Actions**: Pre-defined queries for common tasks
- **Responsive Design**: Optimized for mobile and desktop
- **Modern UI**: Cream background with orange accents

### Chat Components

**MessageBubble.tsx**:
- Sent/received message styling
- Agent attribution (Orchestrator vs UrduSpecialist)
- Tool call indicators with animations
- Timestamp display

**ChatInput.tsx**:
- Text input with loading states
- Disabled state during agent processing
- Error state handling
- Enter-to-submit functionality

**ChatHeader.tsx**:
- System status display
- Active agent indicators
- Connection status

**QuickActions.tsx**:
- Preset queries: "Create task", "List tasks", "Urdu test"
- One-click message sending
- Context-aware suggestions

### Chat API Integration

```typescript
// lib/api.ts - Chat endpoints
export async function chatWithAgents(message: string, userId: string) {
  const token = getAuthToken()

  return apiRequest('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message, user_id: userId })
  })
}

export async function getChatHealth() {
  return apiRequest('/api/chat/health')
}
```

```typescript
// hooks/useChat.ts
import { useMutation, useQuery } from '@tanstack/react-query'

export function useChat(userId: string) {
  return useMutation({
    mutationFn: (message: string) =>
      chatWithAgents(message, userId),
    onSuccess: (data) => {
      // Handle agent response
      console.log('Agent:', data.agent)
      console.log('Tool calls:', data.tool_calls)
    }
  })
}

export function useChatHealth() {
  return useQuery({
    queryKey: ['chat-health'],
    queryFn: getChatHealth,
    refetchInterval: 30000 // Health check every 30s
  })
}
```

### Chat Features

**Agent Attribution**:
- Visual badges showing which agent responded
- Color-coded by agent type
- Tool execution indicators

**Message States**:
- Sending: Optimistic UI updates
- Processing: Loading indicators
- Success: Message with agent attribution
- Error: Retry capability with error messages

**Tool Call Visualization**:
- Real-time display of MCP tool execution
- Success/failure indicators
- Data returned from tools

**Urdu Language Support**:
- Specialized Urdu agent responses
- Cultural context awareness
- Language detection and routing

### Example Chat Flow

```typescript
// User sends message
const { mutate, isPending } = useChat(userId)

// Quick action example
const handleQuickAction = (action: string) => {
  mutate(action)
}

// Message display
{messages.map((msg, idx) => (
  <MessageBubble
    key={idx}
    message={msg.content}
    agent={msg.agent}
    toolCalls={msg.tool_calls}
    timestamp={msg.timestamp}
  />
))}
```

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

**Branch**: `005-fastapi-backend` ✅ Complete
**Tasks**: 191/191 (100% complete)
**Status**: ✅ **Ready for production**

### Completed Features

- ✅ Project setup with Next.js 16+
- ✅ Better Auth integration
- ✅ Complete authentication flow
- ✅ Profile management with password change
- ✅ 20+ reusable UI components
- ✅ Modern Technical Editorial design system
- ✅ TypeScript strict mode compliance
- ✅ React Query integration
- ✅ API client with error handling
- ✅ Protected routes with AuthGuard
- ✅ Ready for FastAPI backend integration

### Next Steps

1. **Integration**: Connect to FastAPI backend endpoints
2. **Testing**: End-to-end testing with real backend
3. **Deployment**: Production deployment with environment variables
4. **Monitoring**: Add error tracking and analytics

---

**Project**: Todo Full-Stack Application
**Phase**: 2 (Complete ✅)
**Framework**: Next.js 16+
**Status**: Production Ready