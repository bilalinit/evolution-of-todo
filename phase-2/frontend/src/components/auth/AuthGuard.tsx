/**
 * AuthGuard Component
 *
 * Protects routes by checking authentication status.
 * Redirects to login if user is not authenticated.
 * Shows loading state while checking authentication.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/hooks";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { session, isLoading, isAuthenticated } = useSession();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for session check to complete
    if (!isLoading) {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        router.replace("/login");
      } else {
        // User is authenticated, allow access
        setIsChecking(false);
      }
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading spinner while checking authentication
  if (isLoading || isChecking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-foreground text-sm">Checking authentication...</p>
      </div>
    );
  }

  // If authenticated, render children
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Return null while redirecting
  return null;
}

/**
 * PublicRoute Component
 *
 * For routes that should only be accessible when NOT authenticated
 * (e.g., login, signup pages)
 */
export function PublicRoute({ children }: AuthGuardProps) {
  const router = useRouter();
  const { session, isLoading, isAuthenticated } = useSession();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Redirect to dashboard if already authenticated
        router.replace("/tasks");
      } else {
        // User is not authenticated, allow access
        setIsChecking(false);
      }
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || isChecking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-foreground text-sm">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return null;
}