/**
 * Login Form Component
 *
 * Email/password authentication form with validation and loading states.
 * Uses React Hook Form for form management and the useSignIn hook for authentication.
 */

"use client";

import { useForm } from "react-hook-form";
import { useSignIn } from "@/lib/auth/hooks";
import { getJwtToken } from "@/lib/auth/auth-client";
import { setApiToken } from "@/lib/api/tasks";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { useState } from "react";
import Link from "next/link";

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    mode: "onChange",
  });

  const signIn = useSignIn();
  const [generalError, setGeneralError] = useState<string | null>(null);

  const onSubmit = async (data: LoginFormData) => {
    setGeneralError(null);
    try {
      await signIn.mutateAsync({
        email: data.email,
        password: data.password,
      });

      // Set JWT token for API calls to FastAPI backend
      const token = await getJwtToken();
      if (token) {
        setApiToken(token);
      }
    } catch (error) {
      // Error is handled by the hook, but we can set a general error for UI
      setGeneralError("Invalid email or password. Please try again.");
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-serif text-center">Welcome Back</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* General Error Alert */}
          {generalError && (
            <Alert variant="destructive">
              <AlertDescription>{generalError}</AlertDescription>
            </Alert>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              disabled={signIn.isPending}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
              disabled={signIn.isPending}
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={signIn.isPending || !isValid}
            loading={signIn.isPending}
          >
            {signIn.isPending ? "Signing in..." : "Sign In"}
          </Button>

          {/* Links */}
          <div className="text-center text-sm space-y-2">
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-accent hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}