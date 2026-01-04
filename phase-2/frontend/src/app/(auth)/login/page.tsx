/**
 * Login Page
 *
 * Public route for user authentication.
 */

import { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { PublicRoute } from "@/components/auth/AuthGuard";

export const metadata: Metadata = {
  title: "Login - Todo App",
  description: "Sign in to your Todo App account",
};

export default function LoginPage() {
  return (
    <PublicRoute>
      <main className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md space-y-6 animate-fade-in-up">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-serif font-bold text-foreground">
              Todo App
            </h1>
            <p className="text-muted-foreground">
              Sign in to manage your tasks
            </p>
          </div>
          <LoginForm />
        </div>
      </main>
    </PublicRoute>
  );
}