/**
 * Authentication Types
 *
 * Type definitions for authentication state, user data, and session management.
 * Compatible with Better Auth and the application's auth hooks.
 */

import { Session, User } from "better-auth";

// ============================================================================
// AUTHENTICATION STATE
// ============================================================================

/**
 * Authentication State Interface
 * Complete state representation for authentication status
 */
export interface AuthState {
  status: 'loading' | 'authenticated' | 'unauthenticated';
  user: User | null;
  session: Session | null;
}

/**
 * Auth Actions Interface
 * Contract for auth-related callbacks
 */
export interface AuthActions {
  onLogin: () => void;
  onLogout: () => void;
  onSignup: () => void;
}

// ============================================================================
// USER TYPES
// ============================================================================

/**
 * Extended User Interface
 * Additional fields beyond Better Auth's default User type
 */
export interface ExtendedUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
  emailVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  // Add any custom fields here
  // educationLevel?: string;
  // programmingExperience?: string;
}

/**
 * Session Data Interface
 * Complete session information including JWT token
 */
export interface SessionData {
  user: ExtendedUser;
  token: string;
  expiresAt: Date;
}

// ============================================================================
// AUTH FORM TYPES
// ============================================================================

/**
 * Sign In Form Data
 */
export interface SignInFormData {
  email: string;
  password: string;
}

/**
 * Sign Up Form Data
 */
export interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * Password Change Form Data
 */
export interface PasswordChangeFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Profile Update Form Data
 */
export interface ProfileUpdateFormData {
  name: string;
  email: string;
  image?: string;
}

// ============================================================================
// AUTH ERRORS
// ============================================================================

/**
 * Auth Error Types
 */
export type AuthErrorType =
  | 'INVALID_CREDENTIALS'
  | 'USER_NOT_FOUND'
  | 'EMAIL_ALREADY_EXISTS'
  | 'INVALID_EMAIL'
  | 'WEAK_PASSWORD'
  | 'PASSWORD_MISMATCH'
  | 'UNAUTHORIZED'
  | 'SESSION_EXPIRED'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * Auth Error Interface
 */
export interface AuthError {
  type: AuthErrorType;
  message: string;
  field?: string;
}

// ============================================================================
// AUTH RESPONSES
// ============================================================================

/**
 * Sign In Response
 */
export interface SignInResponse {
  success: boolean;
  user?: ExtendedUser;
  token?: string;
  error?: AuthError;
}

/**
 * Sign Up Response
 */
export interface SignUpResponse {
  success: boolean;
  user?: ExtendedUser;
  token?: string;
  error?: AuthError;
}

/**
 * Sign Out Response
 */
export interface SignOutResponse {
  success: boolean;
  error?: AuthError;
}

// ============================================================================
// AUTH HOOK RETURNS
// ============================================================================

/**
 * useSession Hook Return Type
 */
export interface UseSessionReturn {
  session: SessionData | null;
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  user: ExtendedUser | null;
}

/**
 * useAuth Hook Return Type
 */
export interface UseAuthReturn {
  // Session state
  session: SessionData | null;
  user: ExtendedUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;

  // Auth operations
  signIn: (data: SignInFormData) => Promise<void>;
  isSigningIn: boolean;
  signUp: (data: SignUpFormData) => Promise<void>;
  isSigningUp: boolean;
  signOut: () => Promise<void>;
  isSigningOut: boolean;
}

// ============================================================================
// AUTH PROVIDER TYPES
// ============================================================================

/**
 * Auth Provider Props
 */
export interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Auth Context Type
 */
export interface AuthContextType {
  authState: AuthState;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  error: AuthError | null;
  clearError: () => void;
}

// ============================================================================
// JWT TOKEN TYPES
// ============================================================================

/**
 * JWT Token Payload
 */
export interface JWTPayload {
  sub: string;          // User ID
  email: string;        // User email
  name?: string;        // User name
  iat: number;          // Issued at
  exp: number;          // Expiration time
  iss: string;          // Issuer
  aud: string;          // Audience
}

/**
 * Token Refresh Response
 */
export interface TokenRefreshResponse {
  token: string;
  expiresAt: Date;
}

// ============================================================================
// AUTH GUARD TYPES
// ============================================================================

/**
 * Auth Guard Props
 */
export interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

/**
 * Protected Route Configuration
 */
export interface ProtectedRouteConfig {
  requireAuth?: boolean;
  requireVerified?: boolean;
  allowedRoles?: string[];
  redirectPath?: string;
}