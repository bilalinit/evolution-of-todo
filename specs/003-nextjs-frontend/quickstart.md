# Quickstart Guide: Next.js Todo Web Application

**Feature**: 003-nextjs-frontend
**Date**: 2025-12-29
**Status**: Complete

## Overview

This guide provides step-by-step instructions to set up and run the Phase 2 Todo Web Application frontend. The application uses Next.js 16+ (App Router), TypeScript, and Tailwind CSS with the Modern Technical Editorial design system.

## Prerequisites

### Required Tools
- **Node.js**: 18.18+ (LTS version recommended)
- **npm**: 9.0+ (comes with Node.js)
- **Git**: For version control
- **Code Editor**: VS Code recommended

### Optional Tools
- **Docker**: For containerized deployment
- **Postman/Insomnia**: For API testing
- **Browser DevTools**: Chrome/Firefox/Edge

## Quick Setup (5 minutes)

### 1. Clone Repository
```bash
git clone <repository-url>
cd hackathon-todo
git checkout 003-nextjs-frontend
```

### 2. Navigate to Frontend Directory
```bash
cd frontend
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Set Up Environment Variables
Create `.env.local` file in the root of the frontend directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Better Auth Configuration
BETTER_AUTH_SECRET=your-secret-key-here-generate-random-string
BETTER_AUTH_URL=http://localhost:3000

# Optional: Database URL (if using PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/todoapp
```

**Generate a secure secret**:
```bash
# Run this command to generate a random secret
openssl rand -base64 32
```

### 5. Start Development Server
```bash
npm run dev
```

The application will be available at: `http://localhost:3000`

## Project Structure Overview

```
frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Authentication routes
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   ├── (dashboard)/              # Protected routes
│   │   │   ├── tasks/page.tsx
│   │   │   ├── profile/page.tsx
│   │   ├── api/auth/[...all]/route.ts # Better Auth API
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing page
│   │   └── globals.css
│   ├── components/                   # React components
│   │   ├── ui/                       # Reusable UI primitives
│   │   ├── tasks/                    # Task-specific components
│   │   ├── auth/                     # Auth components
│   │   ├── profile/                  # Profile components
│   │   └── layout/                   # Layout components
│   ├── lib/                          # Utilities and configuration
│   │   ├── api/                      # API client
│   │   ├── auth/                     # Auth configuration
│   │   ├── utils/                    # Helper functions
│   │   └── constants.ts
│   ├── hooks/                        # Custom React hooks
│   └── types/                        # TypeScript definitions
├── public/                           # Static assets
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

## Development Workflow

### Starting the App
```bash
npm run dev
```

### Building for Production
```bash
npm run build
npm start
```

### Running Tests
```bash
npm run test          # Run all tests
npm run test:unit     # Unit tests only
npm run test:e2e      # End-to-end tests
```

### Code Quality
```bash
npm run lint          # ESLint
npm run type-check    # TypeScript compilation
npm run format        # Prettier formatting
```

## Core Features Usage

### 1. User Authentication

#### Signup Flow
1. Navigate to `http://localhost:3000/signup`
2. Fill in name, email, and password
3. Submit form
4. Automatically redirected to `/tasks`

#### Login Flow
1. Navigate to `http://localhost:3000/login`
2. Enter email and password
3. Submit form
4. Automatically redirected to `/tasks`

#### Session Management
- Sessions are stored in secure HTTP-only cookies
- Automatic token refresh before expiration
- Protected routes redirect to login if not authenticated

### 2. Task Management

#### Creating a Task
1. Click "Add Task" button on tasks page
2. Fill in the form:
   - **Title** (required): Task description
   - **Description** (optional): More details
   - **Priority**: Low, Medium, or High
   - **Category**: Work, Personal, Shopping, Health, or Other
   - **Due Date**: Optional date
3. Click "Create Task"
4. Task appears in list with optimistic update

#### Viewing Tasks
- Tasks are displayed in a list with all details
- Visual indicators for completion, priority, and category
- Empty state shown when no tasks exist

#### Editing a Task
1. Click the pencil icon on any task
2. Modal opens with pre-filled data
3. Modify fields as needed
4. Click "Save Changes"
5. Task updates immediately with optimistic UI

#### Completing a Task
1. Click the checkbox next to a task
2. Task immediately shows as completed (strikethrough, reduced opacity)
3. API call happens in background
4. Error handling if API call fails (reverts state)

#### Deleting a Task
1. Click the trash icon on any task
2. Confirmation dialog appears
3. Click "Confirm Delete"
4. Task removed from list immediately
5. Toast notification confirms deletion

### 3. Search and Filter

#### Search
1. Type in the search box
2. Results filter after 300ms delay
3. Clear button (X) resets search
4. Searches both title and description

#### Filter by Status
- **All**: Show all tasks
- **Pending**: Only incomplete tasks
- **Completed**: Only completed tasks

#### Filter by Priority
- **All**: All priorities
- **High**: Only high priority
- **Medium**: Only medium priority
- **Low**: Only low priority

#### Filter by Category
- **All**: All categories
- **Work**, **Personal**, **Shopping**, **Health**, **Other**: Specific category

#### Sort Tasks
- **Due Date**: Earliest first / Latest first
- **Priority**: High to Low / Low to High
- **Title**: A-Z / Z-A
- **Created Date**: Newest first / Oldest first

### 4. User Profile

#### View Profile
1. Navigate to `/profile`
2. See user information and task statistics
3. View member since date

#### Update Profile
1. On profile page, edit name field
2. Click "Save Changes"
3. Success notification appears

#### Change Password
1. On profile page, fill password change form
2. Enter current password
3. Enter new password
4. Confirm new password
5. Click "Update Password"
6. Success notification appears

#### Logout
1. Click user menu in header
2. Select "Logout"
3. Redirected to landing page

## UI/UX Features

### Design System
- **Colors**: Warm cream background, espresso text, orange accents
- **Typography**: Playfair Display (headings), DM Sans (body), JetBrains Mono (labels)
- **Animations**: Fade-in, stagger effects, smooth transitions
- **Responsive**: Works on mobile (320px+) and desktop

### Loading States
- **Initial Load**: Skeleton screens for tasks
- **Form Submit**: Button loading states
- **API Calls**: Optimistic updates where possible

### Error Handling
- **Form Validation**: Real-time feedback
- **API Errors**: Toast notifications with retry options
- **Network Issues**: Graceful degradation

### Empty States
- **No Tasks**: Welcome message with "Add Task" CTA
- **No Search Results**: "No results for 'query'" message
- **Loading**: Skeleton placeholders

## API Integration

### Backend Requirements
The frontend expects a backend API at `NEXT_PUBLIC_API_URL` with these endpoints:

```
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/{user_id}/tasks
POST   /api/{user_id}/tasks
GET    /api/{user_id}/tasks/{task_id}
PUT    /api/{user_id}/tasks/{task_id}
DELETE /api/{user_id}/tasks/{task_id}
PATCH  /api/{user_id}/tasks/{task_id}/complete
GET    /api/{user_id}/profile
PUT    /api/{user_id}/profile
PUT    /api/{user_id}/password
```

See `contracts/openapi.yaml` for detailed specifications.

### Mock Backend for Development
If you don't have a backend yet, you can use a mock server:

```bash
# Install json-server
npm install -g json-server

# Create a mock database file
cat > db.json <<EOF
{
  "users": [],
  "tasks": []
}
EOF

# Start mock server
json-server --watch db.json --port 8000
```

## Testing the Application

### Manual Testing Checklist

#### Authentication
- [ ] Can create new account
- [ ] Can login with existing account
- [ ] Can logout
- [ ] Protected routes redirect to login
- [ ] Session persists across page refreshes

#### Task CRUD
- [ ] Can create task with all fields
- [ ] Can create task with minimal fields
- [ ] Can view all tasks
- [ ] Can edit any task
- [ ] Can delete task with confirmation
- [ ] Can toggle completion status
- [ ] Optimistic updates work correctly

#### Search and Filter
- [ ] Search filters by title and description
- [ ] Debounce works (300ms delay)
- [ ] Clear search resets list
- [ ] Status filter works
- [ ] Priority filter works
- [ ] Category filter works
- [ ] Sort options work correctly
- [ ] Combined filters work together

#### Profile Management
- [ ] Can view profile information
- [ ] Can update name
- [ ] Can change password
- [ ] Error handling for invalid inputs

#### UI/UX
- [ ] Mobile responsiveness (test on small screen)
- [ ] Loading states appear
- [ ] Error messages display
- [ ] Success toasts show
- [ ] Animations are smooth
- [ ] Empty states display correctly

### Automated Testing
```bash
# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run end-to-end tests
npm run test:e2e

# Run all tests
npm run test
```

## Troubleshooting

### Common Issues

#### "Module not found" errors
```bash
# Clear Next.js cache
npm run clean
npm install
npm run dev
```

#### TypeScript errors
```bash
# Check TypeScript compilation
npm run type-check

# Fix common issues
npm run lint -- --fix
```

#### Environment variables not loading
- Ensure `.env.local` file is in the root of the frontend directory
- Restart the development server after changing env vars
- Variables starting with `NEXT_PUBLIC_` are exposed to the browser

#### Better Auth configuration errors
- Verify `BETTER_AUTH_SECRET` is set (32+ characters)
- Check `BETTER_AUTH_URL` matches your development URL
- Ensure API routes exist at `/api/auth/[...all]/route.ts`

#### API connection issues
- Verify backend is running at `NEXT_PUBLIC_API_URL`
- Check CORS configuration on backend
- Ensure JWT tokens are being sent correctly

#### Styling issues
- Clear Tailwind cache: `npm run clean`
- Verify Tailwind config is correct
- Check that CSS imports are present

### Debug Mode
Enable debug logging by adding to `.env.local`:
```env
NEXT_PUBLIC_DEBUG=true
```

### Getting Help
1. Check the error message in browser console
2. Review the API contract documentation
3. Verify environment variables
4. Check network tab for API requests/responses

## Performance Optimization

### Development
- Use React DevTools for component profiling
- Check Network tab for API performance
- Monitor bundle size with `npm run build`

### Production Build
```bash
npm run build
# Check output for bundle sizes
npm start
```

### Key Performance Targets
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

### Docker
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t todo-frontend .
docker run -p 3000:3000 todo-frontend
```

## Next Steps

### Phase 1: Basic Setup ✅
- [x] Project initialized
- [x] Dependencies installed
- [x] Environment configured

### Phase 2: Core Features
- [ ] Implement authentication flows
- [ ] Build task CRUD operations
- [ ] Add search and filtering
- [ ] Create profile management

### Phase 3: Polish
- [ ] Add animations
- [ ] Optimize performance
- [ ] Add error boundaries
- [ ] Implement testing

### Phase 4: Deployment
- [ ] Configure production environment
- [ ] Set up CI/CD pipeline
- [ ] Deploy to production
- [ ] Monitor and iterate

## Summary

You now have a complete Next.js Todo Web Application frontend ready for development. The application includes:

- ✅ **Modern Architecture**: Next.js 16+ App Router
- ✅ **Type Safety**: Full TypeScript coverage
- ✅ **Design System**: Modern Technical Editorial styling
- ✅ **Authentication**: Better Auth integration
- ✅ **API Layer**: Backend-agnostic client
- ✅ **State Management**: React Query + React Hook Form
- ✅ **Animations**: Framer Motion integration
- ✅ **Testing**: Jest + React Testing Library

**Ready to start building?** Run `npm run dev` and navigate to `http://localhost:3000`!