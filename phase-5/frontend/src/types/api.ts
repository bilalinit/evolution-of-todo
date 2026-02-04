/**
 * API Response Types
 *
 * Defines the structure of API responses and error handling.
 * Based on the specification in specs/003-nextjs-frontend/contracts/rest-api.md
 */

import { Task } from './task';
import { User } from './user';

// Generic API Response Wrapper
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Task API Responses
export interface TaskListResponse {
  tasks: Task[];
  total: number;
  completed_count: number;
  pending_count: number;
}

export interface TaskDetailResponse {
  task: Task;
}

// Auth API Responses
export interface AuthResponse {
  user: User;
  token: string;
  expires_at: string;
}

export interface LogoutResponse {
  message: string;
}

// User Profile Response
export interface UserProfileResponse {
  user: User;
  stats?: {
    total_tasks: number;
    completed_tasks: number;
    pending_tasks: number;
  };
}

// Password Change Response
export interface PasswordChangeResponse {
  message: string;
}

// Error Response
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: {
      field?: string;
      issue?: string;
    };
  };
}

// Custom Error Class
export class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// API Error Codes
export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'AUTH_REQUIRED'
  | 'INVALID_CREDENTIALS'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL_ERROR';

// HTTP Status Codes
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500
}

// Request Configuration
export interface ApiRequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  signal?: AbortSignal;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// API Request Types (for request bodies)
export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  category: 'work' | 'personal' | 'shopping' | 'health' | 'other';
  due_date?: string;
  // Phase 5: Advanced Task Features
  recurring_rule?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurring_end_date?: string;
  reminder_at?: string;
  tags?: string[];
}

export interface UpdateTaskRequest extends CreateTaskRequest {
  completed?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  name: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// Phase 5: Advanced Task Features Types

// Notification Types
export interface Notification {
  id: string;
  user_id: string;
  message: string;
  read: boolean;
  created_at: string;
  task_id?: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  unread_count: number;
}

export interface MarkNotificationReadRequest {
  read: boolean;
}

// Audit Log Types
export type AuditEventType =
  | 'task_created'
  | 'task_updated'
  | 'task_completed'
  | 'task_deleted';

export interface AuditLog {
  id: string;
  event_type: AuditEventType;
  entity_type: string;
  entity_id: string;
  user_id: string;
  timestamp: string;
  data: Record<string, any>;
}

export interface AuditLogListResponse {
  audit_logs: AuditLog[];
  total: number;
}

export interface AuditLogFilters {
  limit?: number;
  event_type?: AuditEventType;
}