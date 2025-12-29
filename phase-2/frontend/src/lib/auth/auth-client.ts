/**
 * Better Auth Client Configuration
 *
 * Handles authentication operations including sign-in, sign-up, and session management.
 * Uses Better Auth library for JWT token management and secure authentication.
 */

import { createAuthClient } from "better-auth/client";
import { toast } from "sonner";

// Create Better Auth client
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
});

/**
 * JWT Token Management
 *
 * Manages JWT tokens in secure storage. In production, these should be
 * handled by Better Auth's secure cookie system, but we provide helpers
 * for additional control.
 */

const TOKEN_KEY = "todo_app_auth_token";
const SESSION_KEY = "todo_app_session";

/**
 * Store authentication token
 */
export function storeToken(token: string): void {
  if (typeof window !== "undefined") {
    // In production, Better Auth handles this via secure cookies
    // This is provided for additional control if needed
    localStorage.setItem(TOKEN_KEY, token);
  }
}

/**
 * Get authentication token
 */
export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

/**
 * Remove authentication token
 */
export function removeToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
  }
}

/**
 * Store session data
 */
export function storeSession(session: any): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

/**
 * Get stored session data
 */
export function getStoredSession(): any | null {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  }
  return null;
}

/**
 * Clear stored session data
 */
export function clearStoredSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  try {
    const response = await authClient.signIn.email({
      email,
      password,
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    toast.success("Signed in successfully!");
    return response.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sign in failed";
    toast.error(message);
    throw error;
  }
}

/**
 * Sign up with name, email, and password
 */
export async function signUp(name: string, email: string, password: string) {
  try {
    const response = await authClient.signUp.email({
      name,
      email,
      password,
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    toast.success("Account created successfully!");
    return response.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sign up failed";
    toast.error(message);
    throw error;
  }
}

/**
 * Sign out current user
 */
export async function signOut() {
  try {
    await authClient.signOut();
    toast.success("Signed out successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sign out failed";
    toast.error(message);
    throw error;
  }
}

/**
 * Get current session
 */
export async function getSession() {
  // DEMO MODE: Check if we're in demo/test mode
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    // Return a mock session for demo purposes
    return {
      user: {
        id: "demo-user-123",
        email: "demo@example.com",
        name: "Demo User",
        created_at: new Date().toISOString(),
      },
      token: "demo-token",
      expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    };
  }

  try {
    const response = await authClient.getSession();

    if (response.error) {
      return null;
    }

    return response.data;
  } catch (error) {
    console.error("Failed to get session:", error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const session = await getSession();
  return session !== null;
}