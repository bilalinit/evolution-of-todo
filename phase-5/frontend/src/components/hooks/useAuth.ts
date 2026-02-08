/**
 * useAuth Hook
 *
 * Custom hook for authentication state and operations.
 * Wraps the existing auth hooks from lib/auth/hooks.ts
 */

"use client";

import { useAuth as useAuthBase, useSession as useSessionBase } from "@/lib/auth/hooks";
import { UseAuthReturn, UseSessionReturn } from "@/types/auth";

/**
 * useAuth - Enhanced authentication hook with type safety
 * Combines session state and auth operations
 */
export function useAuth(): UseAuthReturn {
  const baseAuth = useAuthBase();

  return {
    // Session state - use type assertion to handle Better Auth type differences
    session: baseAuth.session as any,
    user: baseAuth.user as any,
    isLoading: baseAuth.isLoading,
    isAuthenticated: baseAuth.isAuthenticated,
    error: baseAuth.error,

    // Auth operations - use type assertion to handle Better Auth type differences
    signIn: baseAuth.signIn as any,
    isSigningIn: baseAuth.isSigningIn,
    signUp: baseAuth.signUp as any,
    isSigningUp: baseAuth.isSigningUp,
    signOut: baseAuth.signOut as any,
    isSigningOut: baseAuth.isSigningOut,
  };
}

/**
 * useSession - Enhanced session hook with type safety
 * Provides current user session information
 */
export function useSession(): UseSessionReturn {
  const baseSession = useSessionBase();

  return {
    session: baseSession.session as any,
    isLoading: baseSession.isLoading,
    error: baseSession.error,
    isAuthenticated: baseSession.isAuthenticated,
    user: baseSession.user as any,
  };
}

/**
 * useAuthState - Simplified authentication state hook
 * Returns only the authentication status
 */
export function useAuthState() {
  const { isAuthenticated, isLoading, user } = useSession();
  return { isAuthenticated, isLoading, user };
}

/**
 * useAuthActions - Authentication actions only
 * Returns only the auth operations
 */
export function useAuthActions() {
  const { signIn, signUp, signOut, isSigningIn, isSigningUp, isSigningOut } = useAuth();
  return { signIn, signUp, signOut, isSigningIn, isSigningUp, isSigningOut };
}