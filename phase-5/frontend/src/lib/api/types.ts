/**
 * API Types and Constants
 *
 * Re-exports types from @/types/api for convenience and maintains
 * backward compatibility with existing code.
 */

export type {
  // Core types
  ApiError,
  HttpStatus,

  // Response types
  ApiResponse,
  TaskListResponse,
  TaskDetailResponse,
  AuthResponse,
  LogoutResponse,
  UserProfileResponse,
  PasswordChangeResponse,
  ApiErrorResponse,

  // Request types
  ApiRequestConfig,
  CreateTaskRequest,
  UpdateTaskRequest,
  LoginRequest,
  SignupRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,

  // Pagination
  PaginationParams,
  PaginatedResponse,

  // Error codes
  ApiErrorCode
} from '@/types/api';

// Re-export TaskFilters from task types
export type { TaskFilters } from '@/types/task';