/**
 * Task API Functions
 *
 * Provides CRUD operations for tasks with JWT authentication.
 * Based on the specification in specs/003-nextjs-frontend/contracts/rest-api.md
 */

import apiClient from './client';
import {
  TaskListResponse,
  TaskDetailResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskFilters
} from './types';
import { User } from '@/types/user';
import * as demoTasks from './demo-tasks';

/**
 * Get all tasks for the authenticated user
 */
export async function getTasks(userId: string, filters?: TaskFilters): Promise<TaskListResponse> {
  // DEMO MODE: Use mock data
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return demoTasks.getTasks(userId, filters);
  }

  const params = new URLSearchParams();

  if (filters) {
    if (filters.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    if (filters.priority && filters.priority !== 'all') {
      params.append('priority', filters.priority);
    }
    if (filters.category && filters.category !== 'all') {
      params.append('category', filters.category);
    }
    if (filters.search) {
      params.append('search', filters.search);
    }
    if (filters.sort_by) {
      params.append('sort_by', filters.sort_by);
    }
    if (filters.order) {
      params.append('order', filters.order);
    }
  }

  const queryString = params.toString();
  const endpoint = `/api/${userId}/tasks${queryString ? `?${queryString}` : ''}`;

  return apiClient.get<TaskListResponse>(endpoint);
}

/**
 * Get a single task by ID
 */
export async function getTask(userId: string, taskId: string): Promise<TaskDetailResponse> {
  // DEMO MODE: Use mock data
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return demoTasks.getTask(userId, taskId);
  }

  return apiClient.get<TaskDetailResponse>(`/api/${userId}/tasks/${taskId}`);
}

/**
 * Create a new task
 */
export async function createTask(userId: string, data: CreateTaskRequest): Promise<TaskDetailResponse> {
  // DEMO MODE: Use mock data
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return demoTasks.createTask(userId, data);
  }

  return apiClient.post<TaskDetailResponse>(`/api/${userId}/tasks`, data);
}

/**
 * Update an existing task
 */
export async function updateTask(
  userId: string,
  taskId: string,
  data: UpdateTaskRequest
): Promise<TaskDetailResponse> {
  // DEMO MODE: Use mock data
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return demoTasks.updateTask(userId, taskId, data);
  }

  return apiClient.put<TaskDetailResponse>(`/api/${userId}/tasks/${taskId}`, data);
}

/**
 * Delete a task
 */
export async function deleteTask(userId: string, taskId: string): Promise<void> {
  // DEMO MODE: Use mock data
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return demoTasks.deleteTask(userId, taskId);
  }

  return apiClient.delete<void>(`/api/${userId}/tasks/${taskId}`);
}

/**
 * Toggle task completion status
 */
export async function toggleTaskCompletion(
  userId: string,
  taskId: string
): Promise<TaskDetailResponse> {
  // DEMO MODE: Use mock data
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return demoTasks.toggleTaskCompletion(userId, taskId);
  }

  return apiClient.patch<TaskDetailResponse>(`/api/${userId}/tasks/${taskId}/complete`);
}

/**
 * Get user profile and stats
 */
export async function getProfile(userId: string): Promise<any> {
  // DEMO MODE: Use mock data
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return demoTasks.getProfile(userId);
  }

  return apiClient.get(`/api/${userId}/profile`);
}

/**
 * Update user profile
 */
export async function updateProfile(userId: string, data: { name: string }): Promise<any> {
  // DEMO MODE: Use mock data
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return demoTasks.updateProfile(userId, data);
  }

  return apiClient.put(`/api/${userId}/profile`, data);
}

/**
 * Change user password
 */
export async function changePassword(userId: string, data: {
  current_password: string;
  new_password: string;
  confirm_password: string;
}): Promise<any> {
  // DEMO MODE: Use mock data
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return demoTasks.changePassword(userId, data);
  }

  return apiClient.put(`/api/${userId}/password`, data);
}

/**
 * Set the authentication token for all API calls
 */
export function setApiToken(token: string): void {
  apiClient.setToken(token);
}

/**
 * Clear the authentication token
 */
export function clearApiToken(): void {
  apiClient.clearToken();
}