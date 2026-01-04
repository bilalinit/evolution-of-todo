/**
 * PasswordChangeForm Component
 *
 * Form for changing user password.
 */

"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { authClient } from "@/lib/auth/auth-client";

interface PasswordChangeFormProps {
  userId: string; // Kept for compatibility but not used by Better Auth
}

interface PasswordChangeFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export function PasswordChangeForm({ userId }: PasswordChangeFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<PasswordChangeFormData>({
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const newPassword = watch("new_password");

  const onSubmit = async (data: PasswordChangeFormData) => {
    if (!userId) return;

    // Validate passwords match
    if (data.new_password !== data.confirm_password) {
      toast.error("Passwords do not match", {
        description: "Please make sure both new password fields are identical.",
      });
      return;
    }

    // Validate new password meets requirements
    if (data.new_password.length < 8) {
      toast.error("Password too short", {
        description: "New password must be at least 8 characters.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authClient.changePassword({
        currentPassword: data.current_password,
        newPassword: data.new_password,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success("Password updated successfully", {
        description: "Your password has been changed.",
      });

      // Clear form
      reset();
    } catch (error) {
      console.error("Password change error:", error);
      const message = error instanceof Error ? error.message : "Failed to change password";
      toast.error("Failed to change password", {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Change Password</CardTitle>
        <CardDescription>Update your account password</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              label="Current Password"
              placeholder="Enter current password"
              type="password"
              {...register("current_password", {
                required: "Current password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
              error={errors.current_password?.message}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Input
              label="New Password"
              placeholder="Enter new password"
              type="password"
              {...register("new_password", {
                required: "New password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
                validate: {
                  hasNumber: (value) =>
                    /\d/.test(value) || "Must contain at least one number",
                  hasSpecial: (value) =>
                    /[!@#$%^&*(),.?":{}|<>]/.test(value) ||
                    "Must contain at least one special character",
                },
              })}
              error={errors.new_password?.message}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Input
              label="Confirm New Password"
              placeholder="Confirm new password"
              type="password"
              {...register("confirm_password", {
                required: "Please confirm your new password",
                validate: (value) =>
                  value === newPassword || "Passwords do not match",
              })}
              error={errors.confirm_password?.message}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="min-w-[140px]"
            >
              {isSubmitting ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}