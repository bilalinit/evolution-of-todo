/**
 * AuthProvider Component
 *
 * Provides authentication context to the entire application.
 * Uses Better Auth hooks to manage session state.
 */

"use client";

import { createContext, useContext, ReactNode } from "react";
import { useSession } from "@/lib/auth/hooks";
import { AuthState } from "@/types/auth";

const AuthContext = createContext<AuthState | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { session, isLoading, error, isAuthenticated, user } = useSession();

  const authState: AuthState = {
    status: isLoading ? 'loading' : (isAuthenticated ? 'authenticated' : 'unauthenticated'),
    user: (user || null) as any,
    session: (session || null) as any,
  };

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth hook - Access authentication state from context
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}