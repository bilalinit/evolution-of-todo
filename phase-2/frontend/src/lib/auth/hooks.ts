/**
 * Authentication Hooks
 *
 * Custom React hooks for managing authentication state and operations.
 */

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSession, signIn, signUp, signOut } from "./auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

/**
 * useSession hook - manages current user session
 */
export function useSession() {
  const router = useRouter();

  const { data: session, isLoading, error } = useQuery({
    queryKey: ["session"],
    queryFn: getSession,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 1, // Refetch every minute
    refetchOnWindowFocus: true,
  });

  return {
    session,
    isLoading,
    error,
    isAuthenticated: !!session,
    user: session?.user,
  };
}

/**
 * useSignIn hook - handles sign in mutation
 */
export function useSignIn() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signIn(email, password),
    onSuccess: () => {
      // Invalidate and refetch session
      queryClient.invalidateQueries({ queryKey: ["session"] });
      // Redirect to dashboard
      router.push("/tasks");
    },
    onError: (error) => {
      console.error("Sign in error:", error);
    },
  });
}

/**
 * useSignUp hook - handles sign up mutation
 */
export function useSignUp() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ name, email, password }: { name: string; email: string; password: string }) =>
      signUp(name, email, password),
    onSuccess: () => {
      // Invalidate and refetch session
      queryClient.invalidateQueries({ queryKey: ["session"] });
      // Redirect to dashboard
      router.push("/tasks");
      toast.success("Welcome! Your account has been created.");
    },
    onError: (error) => {
      console.error("Sign up error:", error);
    },
  });
}

/**
 * useSignOut hook - handles sign out mutation
 */
export function useSignOut() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      // Clear all queries
      queryClient.clear();
      // Redirect to landing page
      router.push("/");
      router.refresh();
    },
    onError: (error) => {
      console.error("Sign out error:", error);
      // Still clear and redirect even if there's an error
      queryClient.clear();
      router.push("/");
      router.refresh();
    },
  });
}

/**
 * useAuth hook - combines session and auth operations
 */
export function useAuth() {
  const session = useSession();
  const signInMutation = useSignIn();
  const signUpMutation = useSignUp();
  const signOutMutation = useSignOut();

  return {
    // Session state
    session: session.session,
    user: session.user,
    isLoading: session.isLoading,
    isAuthenticated: session.isAuthenticated,
    error: session.error,

    // Auth operations
    signIn: signInMutation.mutate,
    isSigningIn: signInMutation.isPending,
    signUp: signUpMutation.mutate,
    isSigningUp: signUpMutation.isPending,
    signOut: signOutMutation.mutate,
    isSigningOut: signOutMutation.isPending,
  };
}