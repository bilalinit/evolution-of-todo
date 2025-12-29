/**
 * User Entity Types
 *
 * Defines user-related data structures for authentication and profile management.
 * Based on the specification in specs/003-nextjs-frontend/data-model.md
 */

// Core User Entity
export interface User {
  id: string;              // UUID from backend
  email: string;           // User email (unique)
  name?: string;           // Display name (optional)
  image?: string;          // Profile image URL (optional)
  created_at: string;      // ISO 8601 timestamp
}

// Session Entity
export interface Session {
  user: User;              // Current user object
  token: string;           // JWT token for API requests
  expires_at: string;      // Token expiration timestamp (ISO 8601)
}

// Auth Response Types
export interface AuthResponse {
  user: User;
  token: string;
  expires_at: string;
}

// Form Data Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface ProfileUpdateFormData {
  name: string;
  email: string;  // May be read-only depending on backend
}

export interface PasswordChangeFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// API Response Types
export interface UserProfileResponse {
  user: User;
  stats?: {
    total_tasks: number;
    completed_tasks: number;
    pending_tasks: number;
  };
}

// Validation Rules
export const userValidation = {
  name: {
    required: true,
    minLength: 2
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    required: true,
    minLength: 8
  },
  confirm_password: {
    required: true,
    mustMatch: 'password'
  }
};