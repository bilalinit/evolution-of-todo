/**
 * Signup Page
 *
 * Public route for user registration.
 */

import { Metadata } from "next";
import { SignupForm } from "@/components/auth/SignupForm";
import { PublicRoute } from "@/components/auth/AuthGuard";

export const metadata: Metadata = {
  title: "Sign Up - Todo App",
  description: "Create a new Todo App account",
};

export default function SignupPage() {
  return (
    <PublicRoute>
      <main className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md space-y-6 animate-fade-in-up">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-serif font-bold text-foreground">
              Todo App
            </h1>
            <p className="text-muted-foreground">
              Create your account to get started
            </p>
          </div>
          <SignupForm />
        </div>
      </main>
    </PublicRoute>
  );
}