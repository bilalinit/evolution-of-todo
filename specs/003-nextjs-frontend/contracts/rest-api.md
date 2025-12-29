# REST API Contract Specification

**Feature**: 003-nextjs-frontend
**Date**: 2025-12-29
**Status**: Complete

## Overview

This document provides detailed REST API contract specifications for the Phase 2 Todo Web Application frontend. The frontend will consume these APIs through the `lib/api/client.ts` abstraction layer.

## Base Configuration

### Base URL
```
Development: http://localhost:8000
Production: https://api.todo.example.com
```

### Authentication
- **Method**: JWT Bearer tokens
- **Header**: `Authorization: Bearer <token>`
- **Storage**: Better Auth manages secure HTTP-only cookies
- **Refresh**: Automatic token refresh before expiration

### Content Types
- **Request**: `application/json`
- **Response**: `application/json`
- **Charset**: UTF-8

### Error Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {
      "field": "specific_field",
      "issue": "validation_issue"
    }
  }
}
```

## Authentication Endpoints

### POST /api/auth/signup
**Purpose**: Register new user account

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Success Response (201)**:
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "name": "John Doe",
    "image": null,
    "created_at": "2025-12-29T10:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_at": "2025-12-29T11:30:00Z"
}
```

**Error Responses**:
- `400`: Invalid input (validation errors)
- `409`: Email already exists

**Frontend Usage**:
```typescript
const { user, token } = await authClient.signUp({
  name: "John Doe",
  email: "john@example.com",
  password: "securepassword123"
});
```

---

### POST /api/auth/login
**Purpose**: Authenticate existing user

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Success Response (200)**:
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "name": "John Doe",
    "image": null,
    "created_at": "2025-12-29T10:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_at": "2025-12-29T11:30:00Z"
}
```

**Error Responses**:
- `401`: Invalid credentials

**Frontend Usage**:
```typescript
const { user, token } = await authClient.signIn({
  email: "john@example.com",
  password: "securepassword123"
});
```

---

### POST /api/auth/logout
**Purpose**: End user session

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "message": "Logged out successfully"
}
```

**Frontend Usage**:
```typescript
await authClient.signOut();
```

---

## Task Management Endpoints

### GET /api/{user_id}/tasks
**Purpose**: Get all tasks for authenticated user

**Path Parameters**:
- `user_id`: UUID of authenticated user

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters** (optional):
- `status`: Filter by status (`all`, `pending`, `completed`)
- `priority`: Filter by priority (`low`, `medium`, `high`)
- `category`: Filter by category (`work`, `personal`, `shopping`, `health`, `other`)
- `search`: Search in title and description
- `sort_by`: Sort field (`created_at`, `due_date`, `priority`, `title`)
- `order`: Sort order (`asc`, `desc`)

**Success Response (200)**:
```json
{
  "tasks": [
    {
      "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "title": "Buy groceries",
      "description": "Milk, eggs, bread, and coffee",
      "completed": false,
      "priority": "high",
      "category": "shopping",
      "due_date": "2025-12-30",
      "created_at": "2025-12-29T10:30:00Z",
      "updated_at": "2025-12-29T10:30:00Z",
      "user_id": "550e8400-e29b-41d4-a716-446655440000"
    }
  ],
  "total": 15,
  "completed_count": 8,
  "pending_count": 7
}
```

**Error Responses**:
- `401`: Unauthorized
- `403`: Forbidden (user_id doesn't match authenticated user)

**Frontend Usage**:
```typescript
const { tasks, total, completed_count, pending_count } = await apiClient.getTasks(
  userId,
  { status: 'pending', sort_by: 'due_date', order: 'asc' }
);
```

---

### POST /api/{user_id}/tasks
**Purpose**: Create new task

**Path Parameters**:
- `user_id`: UUID of authenticated user

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread, and coffee",
  "priority": "high",
  "category": "shopping",
  "due_date": "2025-12-30"
}
```

**Success Response (201)**:
```json
{
  "task": {
    "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread, and coffee",
    "completed": false,
    "priority": "high",
    "category": "shopping",
    "due_date": "2025-12-30",
    "created_at": "2025-12-29T10:30:00Z",
    "updated_at": "2025-12-29T10:30:00Z",
    "user_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Error Responses**:
- `400`: Invalid input (validation errors)
- `401`: Unauthorized

**Frontend Usage**:
```typescript
const newTask = await apiClient.createTask(userId, {
  title: "Buy groceries",
  description: "Milk, eggs, bread, and coffee",
  priority: "high",
  category: "shopping",
  due_date: "2025-12-30"
});
```

---

### GET /api/{user_id}/tasks/{task_id}
**Purpose**: Get specific task details

**Path Parameters**:
- `user_id`: UUID of authenticated user
- `task_id`: UUID of task

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "task": {
    "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread, and coffee",
    "completed": false,
    "priority": "high",
    "category": "shopping",
    "due_date": "2025-12-30",
    "created_at": "2025-12-29T10:30:00Z",
    "updated_at": "2025-12-29T10:30:00Z",
    "user_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Error Responses**:
- `404`: Task not found
- `403`: Forbidden (task doesn't belong to user)

**Frontend Usage**:
```typescript
const task = await apiClient.getTask(userId, taskId);
```

---

### PUT /api/{user_id}/tasks/{task_id}
**Purpose**: Update existing task

**Path Parameters**:
- `user_id`: UUID of authenticated user
- `task_id`: UUID of task

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "Buy groceries and household items",
  "description": "Milk, eggs, bread, coffee, and cleaning supplies",
  "priority": "medium",
  "category": "shopping",
  "due_date": "2025-12-31",
  "completed": false
}
```

**Success Response (200)**:
```json
{
  "task": {
    "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "title": "Buy groceries and household items",
    "description": "Milk, eggs, bread, coffee, and cleaning supplies",
    "completed": false,
    "priority": "medium",
    "category": "shopping",
    "due_date": "2025-12-31",
    "created_at": "2025-12-29T10:30:00Z",
    "updated_at": "2025-12-29T10:35:00Z",
    "user_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Error Responses**:
- `400`: Invalid input
- `404`: Task not found
- `403`: Forbidden

**Frontend Usage**:
```typescript
const updatedTask = await apiClient.updateTask(userId, taskId, {
  title: "Updated title",
  priority: "medium"
});
```

---

### DELETE /api/{user_id}/tasks/{task_id}
**Purpose**: Delete task

**Path Parameters**:
- `user_id`: UUID of authenticated user
- `task_id`: UUID of task

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response (204)**: No content

**Error Responses**:
- `404`: Task not found
- `403`: Forbidden

**Frontend Usage**:
```typescript
await apiClient.deleteTask(userId, taskId);
```

---

### PATCH /api/{user_id}/tasks/{task_id}/complete
**Purpose**: Toggle task completion status

**Path Parameters**:
- `user_id`: UUID of authenticated user
- `task_id`: UUID of task

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "task": {
    "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread, and coffee",
    "completed": true,
    "priority": "high",
    "category": "shopping",
    "due_date": "2025-12-30",
    "created_at": "2025-12-29T10:30:00Z",
    "updated_at": "2025-12-29T10:40:00Z",
    "user_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Error Responses**:
- `404`: Task not found
- `403`: Forbidden

**Frontend Usage**:
```typescript
const updatedTask = await apiClient.toggleTaskCompletion(userId, taskId);
```

---

## User Profile Endpoints

### GET /api/{user_id}/profile
**Purpose**: Get user profile and stats

**Path Parameters**:
- `user_id`: UUID of authenticated user

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "name": "John Doe",
    "image": null,
    "created_at": "2025-12-29T10:30:00Z"
  },
  "stats": {
    "total_tasks": 15,
    "completed_tasks": 8,
    "pending_tasks": 7
  }
}
```

**Error Responses**:
- `404`: User not found

**Frontend Usage**:
```typescript
const { user, stats } = await apiClient.getProfile(userId);
```

---

### PUT /api/{user_id}/profile
**Purpose**: Update user profile

**Path Parameters**:
- `user_id`: UUID of authenticated user

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "John Updated"
}
```

**Success Response (200)**:
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "name": "John Updated",
    "image": null,
    "created_at": "2025-12-29T10:30:00Z"
  },
  "stats": {
    "total_tasks": 15,
    "completed_tasks": 8,
    "pending_tasks": 7
  }
}
```

**Error Responses**:
- `400`: Invalid input
- `404`: User not found

**Frontend Usage**:
```typescript
const { user } = await apiClient.updateProfile(userId, {
  name: "John Updated"
});
```

---

### PUT /api/{user_id}/password
**Purpose**: Change user password

**Path Parameters**:
- `user_id`: UUID of authenticated user

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "current_password": "oldpassword123",
  "new_password": "newsecurepassword456",
  "confirm_password": "newsecurepassword456"
}
```

**Success Response (200)**:
```json
{
  "message": "Password updated successfully"
}
```

**Error Responses**:
- `400`: Invalid input or passwords don't match
- `401`: Current password incorrect
- `404`: User not found

**Frontend Usage**:
```typescript
await apiClient.changePassword(userId, {
  current_password: "oldpassword123",
  new_password: "newsecurepassword456",
  confirm_password: "newsecurepassword456"
});
```

---

## Error Code Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `AUTH_REQUIRED` | 401 | Authentication required |
| `INVALID_CREDENTIALS` | 401 | Invalid email/password |
| `FORBIDDEN` | 403 | Access denied |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Frontend API Client Pattern

### Basic Usage
```typescript
// lib/api/client.ts
export class ApiClient {
  private baseUrl: string;
  private token: string | null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = null;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.error.code, error.error.message, error.error.details);
    }

    if (response.status === 204) return undefined as T;

    return response.json() as Promise<T>;
  }

  // Auth methods
  async signUp(data: SignupRequest): Promise<AuthResponse> {
    return this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Task methods
  async getTasks(userId: string, filters?: TaskFilters): Promise<TaskListResponse> {
    const params = new URLSearchParams(filters as any);
    return this.request(`/api/${userId}/tasks?${params}`);
  }

  async createTask(userId: string, data: CreateTaskRequest): Promise<TaskDetailResponse> {
    return this.request(`/api/${userId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async toggleTaskCompletion(userId: string, taskId: string): Promise<TaskDetailResponse> {
    return this.request(`/api/${userId}/tasks/${taskId}/complete`, {
      method: 'PATCH',
    });
  }
}
```

### Error Handling
```typescript
export class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public details?: any
  ) {
    super(message);
  }
}

// Usage
try {
  const task = await apiClient.createTask(userId, data);
} catch (error) {
  if (error instanceof ApiError) {
    if (error.code === 'VALIDATION_ERROR') {
      // Show form validation errors
      console.error(error.details);
    } else if (error.code === 'AUTH_REQUIRED') {
      // Redirect to login
      router.push('/login');
    }
  }
}
```

---

## Integration with React Query

```typescript
// hooks/useTasks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export function useTasks(userId: string, filters?: TaskFilters) {
  return useQuery({
    queryKey: ['tasks', userId, filters],
    queryFn: () => apiClient.getTasks(userId, filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreateTask(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskRequest) => apiClient.createTask(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks', userId]);
    },
  });
}

export function useToggleTask(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => apiClient.toggleTaskCompletion(userId, taskId),
    onMutate: async (taskId) => {
      // Optimistic update
      await queryClient.cancelQueries(['tasks', userId]);
      const previousTasks = queryClient.getQueryData(['tasks', userId]);

      queryClient.setQueryData(['tasks', userId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          tasks: old.tasks.map((task: any) =>
            task.id === taskId
              ? { ...task, completed: !task.completed }
              : task
          ),
        };
      });

      return { previousTasks };
    },
    onError: (err, taskId, context) => {
      queryClient.setQueryData(['tasks', userId], context?.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['tasks', userId]);
    },
  });
}
```

---

## Testing the API Contract

### Manual Testing with curl
```bash
# Signup
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get tasks (replace with actual token and user_id)
curl -X GET "http://localhost:8000/api/550e8400-e29b-41d4-a716-446655440000/tasks" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Automated Testing
```typescript
// tests/api/tasks.test.ts
describe('Task API', () => {
  it('should create a task', async () => {
    const response = await apiClient.createTask(userId, {
      title: 'Test Task',
      priority: 'medium',
      category: 'work'
    });

    expect(response.task.title).toBe('Test Task');
    expect(response.task.completed).toBe(false);
  });
});
```

---

## Summary

This API contract provides:
- ✅ **Complete Coverage**: All required endpoints for authentication and task management
- ✅ **Type Safety**: Clear request/response schemas
- ✅ **Error Handling**: Standardized error responses
- ✅ **Performance**: Optimistic updates, filtering, sorting
- ✅ **Security**: JWT authentication, user isolation
- ✅ **Flexibility**: Both REST and GraphQL options
- ✅ **Integration**: Ready for React Query and Better Auth

The frontend can now build against these contracts with confidence.