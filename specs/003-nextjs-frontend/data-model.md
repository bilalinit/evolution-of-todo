# Data Model: Next.js Todo Web Application Frontend

**Feature**: 003-nextjs-frontend
**Date**: 2025-12-29
**Status**: Complete

## Overview

This document defines the TypeScript interfaces and data structures for the frontend application, based on the entities specified in the feature specification.

## Entity Definitions

### User Entity

Represents a system user who owns tasks and has an active session.

```typescript
interface User {
  id: string;              // UUID from backend
  email: string;           // User email (unique)
  name?: string;           // Display name (optional)
  image?: string;          // Profile image URL (optional)
  created_at: string;      // ISO 8601 timestamp
}
```

**Validation Rules**:
- `id`: Must be valid UUID format
- `email`: Required, valid email format, unique
- `name`: Optional, min 2 characters if provided
- `image`: Optional, must be valid URL if provided
- `created_at`: ISO 8601 format, auto-generated

**Usage Contexts**:
- Current user in session state
- User data in profile page
- Owner reference in task entities

---

### Task Entity

Represents a todo item with full metadata for organization and filtering.

```typescript
interface Task {
  id: string;              // UUID from backend
  title: string;           // Task title (1-200 chars)
  description?: string;    // Optional description (max 1000 chars)
  completed: boolean;      // Completion status
  priority: PriorityLevel; // Priority level
  category: Category;      // Category tag
  due_date?: string;       // ISO 8601 date string (optional)
  created_at: string;      // ISO 8601 timestamp
  updated_at: string;      // ISO 8601 timestamp
  user_id: string;         // Owner's user ID (UUID)
}

type PriorityLevel = 'low' | 'medium' | 'high';
type Category = 'work' | 'personal' | 'shopping' | 'health' | 'other';
```

**Validation Rules**:
- `id`: Must be valid UUID format
- `title`: Required, 1-200 characters
- `description`: Optional, max 1000 characters
- `completed`: Required, boolean
- `priority`: Required, one of: 'low', 'medium', 'high'
- `category`: Required, one of: 'work', 'personal', 'shopping', 'health', 'other'
- `due_date`: Optional, must be today or future date if provided
- `created_at`: ISO 8601 format, auto-generated
- `updated_at`: ISO 8601 format, auto-updated on changes
- `user_id`: Required, valid UUID, must match authenticated user

**State Transitions**:
- `pending` → `completed`: Via checkbox toggle (PATCH /tasks/{id}/complete)
- `completed` → `pending`: Via checkbox toggle (PATCH /tasks/{id}/complete)
- All fields → Updated values: Via edit form (PUT /tasks/{id})

---

### Session Entity

Represents an authenticated user session with JWT token for API authentication.

```typescript
interface Session {
  user: User;              // Current user object
  token: string;           // JWT token for API requests
  expires_at: string;      // Token expiration timestamp (ISO 8601)
}
```

**Validation Rules**:
- `user`: Must be valid User object
- `token`: Required JWT string
- `expires_at`: ISO 8601 format, future timestamp

**Usage Contexts**:
- Stored in secure HTTP-only cookies (Better Auth)
- Included in Authorization header for API calls
- Checked for expiration before API requests

---

## Filter & Sort Types

### Task Status Filter

```typescript
type TaskStatus = 'all' | 'pending' | 'completed';
```

**Usage**: Client-side filtering of task list
- `all`: Show all tasks
- `pending`: Show only incomplete tasks (`completed: false`)
- `completed`: Show only completed tasks (`completed: true`)

---

### Sort Field

```typescript
type SortField = 'created_at' | 'due_date' | 'priority' | 'title';
```

**Usage**: Determines which field to sort tasks by

---

### Sort Order

```typescript
type SortOrder = 'asc' | 'desc';
```

**Usage**: Determines sort direction
- `asc`: Ascending (A-Z, oldest first, lowest priority first)
- `desc`: Descending (Z-A, newest first, highest priority first)

---

### Combined Sort Configuration

```typescript
interface SortConfig {
  field: SortField;
  order: SortOrder;
}
```

**Default**: `{ field: 'created_at', order: 'desc' }` (newest first)

---

## Form Data Types

### Create Task Form

```typescript
interface CreateTaskFormData {
  title: string;
  description?: string;
  priority: PriorityLevel;
  category: Category;
  due_date?: string;  // Date string in YYYY-MM-DD format
}
```

**Default Values**:
```typescript
{
  title: '',
  description: '',
  priority: 'medium',
  category: 'other',
  due_date: undefined
}
```

---

### Update Task Form

```typescript
interface UpdateTaskFormData extends CreateTaskFormData {
  // Same as CreateTaskFormData, but all fields are pre-populated
}
```

---

### Login Form

```typescript
interface LoginFormData {
  email: string;
  password: string;
}
```

**Validation**:
- `email`: Required, valid email format
- `password`: Required, min 8 characters

---

### Signup Form

```typescript
interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
}
```

**Validation**:
- `name`: Required, min 2 characters
- `email`: Required, valid email format
- `password`: Required, min 8 characters
- `confirm_password`: Required, must match `password`

---

### Profile Update Form

```typescript
interface ProfileUpdateFormData {
  name: string;
  email: string;  // May be read-only depending on backend
}
```

**Validation**:
- `name`: Required, min 2 characters
- `email`: Required, valid email format

---

### Password Change Form

```typescript
interface PasswordChangeFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}
```

**Validation**:
- `current_password`: Required, min 8 characters
- `new_password`: Required, min 8 characters
- `confirm_password`: Required, must match `new_password`

---

## API Response Types

### Task List Response

```typescript
interface TaskListResponse {
  tasks: Task[];
  total: number;
  completed_count: number;
  pending_count: number;
}
```

---

### Task Detail Response

```typescript
interface TaskDetailResponse {
  task: Task;
}
```

---

### User Profile Response

```typescript
interface UserProfileResponse {
  user: User;
  stats?: {
    total_tasks: number;
    completed_tasks: number;
    pending_tasks: number;
  };
}
```

---

### Auth Response

```typescript
interface AuthResponse {
  user: User;
  token: string;
  expires_at: string;
}
```

---

## Filter State

### Active Filters

```typescript
interface ActiveFilters {
  status: TaskStatus;
  priority: PriorityLevel | 'all';
  category: Category | 'all';
}
```

**Default Values**:
```typescript
{
  status: 'all',
  priority: 'all',
  category: 'all'
}
```

---

### Search State

```typescript
interface SearchState {
  query: string;
  isSearching: boolean;
}
```

**Default Values**:
```typescript
{
  query: '',
  isSearching: false
}
```

---

## UI State Types

### Loading States

```typescript
interface LoadingState {
  isLoading: boolean;
  type: 'initial' | 'create' | 'update' | 'delete' | 'toggle' | 'auth';
}
```

---

### Error States

```typescript
interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
  details?: any;
}
```

---

### Modal State

```typescript
interface ModalState {
  isOpen: boolean;
  mode: 'create' | 'edit';
  taskId?: string;  // Only for edit mode
}
```

**Default Values**:
```typescript
{
  isOpen: false,
  mode: 'create',
  taskId: undefined
}
```

---

### Empty State Type

```typescript
type EmptyStateType = 'no-tasks' | 'no-results' | 'loading' | 'error';
```

---

## Validation Schemas

### Task Validation

```typescript
const taskValidation = {
  title: {
    required: true,
    minLength: 1,
    maxLength: 200
  },
  description: {
    required: false,
    maxLength: 1000
  },
  priority: {
    required: true,
    allowedValues: ['low', 'medium', 'high']
  },
  category: {
    required: true,
    allowedValues: ['work', 'personal', 'shopping', 'health', 'other']
  },
  due_date: {
    required: false,
    futureDate: true
  }
};
```

---

## Data Flow Patterns

### 1. Authentication Flow
```
User Login/Signup → AuthResponse → Session → Store in cookies → Include in API headers
```

### 2. Task CRUD Flow
```
Create: FormData → POST /api/{user_id}/tasks → Task → Optimistic Update → Refresh list
Read: GET /api/{user_id}/tasks → Task[] → Filter/Sort → Display
Update: FormData → PUT /api/{user_id}/tasks/{id} → Task → Optimistic Update
Delete: DELETE /api/{user_id}/tasks/{id} → 204 → Optimistic Remove
Toggle: PATCH /api/{user_id}/tasks/{id}/complete → Task → Optimistic Update
```

### 3. Filter/Sort Flow
```
User Input → Update Filter/Sort State → Apply to Task List → Re-render
```

### 4. Search Flow
```
User Input → Debounce (300ms) → Filter by title/description → Update display
```

---

## Type Safety Guarantees

### 1. API Response Validation
All API responses are typed and validated before use in components.

### 2. Form Input Validation
All form inputs use typed schemas with real-time validation feedback.

### 3. State Management
All application state uses TypeScript interfaces for compile-time safety.

### 4. Component Props
All component props are explicitly typed with required vs optional fields.

---

## Integration Points

### Frontend → Backend
- **Authentication**: Better Auth handles JWT token management
- **API Client**: `lib/api/client.ts` provides typed HTTP functions
- **Error Handling**: `ApiError` class with typed error responses

### State → UI
- **React Query**: Manages server state with typed hooks
- **React Hook Form**: Manages form state with typed validation
- **Context/Props**: Pass typed data between components

### User → Application
- **Forms**: Type-safe form submissions
- **Interactions**: Type-safe event handlers
- **Navigation**: Type-safe route transitions

---

## Performance Considerations

### 1. Memory Usage
- **Task List**: Virtual scrolling for large lists (>100 tasks)
- **Search**: Debounced filtering to prevent excessive re-renders
- **Images**: Lazy loading for user avatars

### 2. Network Efficiency
- **Caching**: React Query caches API responses
- **Optimistic Updates**: Immediate UI feedback, reduce perceived latency
- **Batching**: Multiple operations where possible

### 3. Type Safety Benefits
- **Compile-time**: Catch errors before runtime
- **IDE Support**: Better autocomplete and refactoring
- **Documentation**: Types serve as living documentation

---

## Migration Considerations

### Future Enhancements
1. **Tags System**: Add `tags: string[]` to Task interface
2. **Subtasks**: Add `subtasks: Subtask[]` to Task interface
3. **Attachments**: Add `attachments: Attachment[]` to Task interface
4. **Recurrence**: Add `recurrence: RecurrenceRule` to Task interface
5. **Collaboration**: Add `shared_with: User[]` to Task interface

### Backward Compatibility
All current types are designed to be extensible without breaking existing functionality.

---

## Summary

This data model provides:
- ✅ **Type Safety**: Full TypeScript coverage for all entities
- ✅ **Validation**: Clear rules for all input fields
- ✅ **Flexibility**: Optional fields where appropriate
- ✅ **Extensibility**: Easy to add new features
- ✅ **Performance**: Optimized for React/Next.js patterns
- ✅ **Integration**: Seamless connection to API layer

All types align with the feature specification and support the Modern Technical Editorial design system requirements.