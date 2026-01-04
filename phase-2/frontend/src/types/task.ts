/**
 * Task Entity Types
 *
 * Defines the core data structures for task management.
 * Based on the specification in specs/003-nextjs-frontend/data-model.md
 */

// Core Task Entity
export interface Task {
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

// Type Definitions
export type PriorityLevel = 'low' | 'medium' | 'high';
export type Category = 'work' | 'personal' | 'shopping' | 'health' | 'other';

// Filter and Sort Types
export type TaskStatus = 'all' | 'pending' | 'completed';
export type SortField = 'created_at' | 'due_date' | 'priority' | 'title';
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}

export interface ActiveFilters {
  status: TaskStatus;
  priority: PriorityLevel | 'all';
  category: Category | 'all';
}

export interface SearchState {
  query: string;
  isSearching: boolean;
}

// API Request Types
export interface TaskFilters {
  status?: TaskStatus;
  priority?: PriorityLevel | 'all';
  category?: Category | 'all';
  search?: string;
  sort_by?: SortField;
  order?: SortOrder;
}

// Form Data Types
export interface CreateTaskFormData {
  title: string;
  description?: string;
  priority: PriorityLevel;
  category: Category;
  due_date?: string;  // Date string in YYYY-MM-DD format
}

export interface UpdateTaskFormData extends CreateTaskFormData {
  // Same as CreateTaskFormData, but all fields are pre-populated
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  type: 'initial' | 'create' | 'update' | 'delete' | 'toggle' | 'auth';
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
  details?: any;
}

export interface ModalState {
  isOpen: boolean;
  mode: 'create' | 'edit';
  taskId?: string;  // Only for edit mode
}

export type EmptyStateType = 'no-tasks' | 'no-results' | 'loading' | 'error';

// Validation Rules
export const taskValidation = {
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