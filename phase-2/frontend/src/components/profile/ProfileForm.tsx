/**
 * ProfileForm Component
 *
 * Form for updating user profile information.
 */

"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { User } from "@/types/user";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { authClient } from "@/lib/auth/auth-client";

interface ProfileFormProps {
  user: User;
  onProfileUpdate: (updatedUser: User) => void;
}

interface ProfileFormData {
  name: string;
  email: string;
}

export function ProfileForm({ user, onProfileUpdate }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: user.name || "",
      email: user.email,
    },
  });

  // Update form values when user changes
  React.useEffect(() => {
    setValue("name", user.name || "");
    setValue("email", user.email);
  }, [user, setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user.id) return;

    setIsSubmitting(true);

    try {
      const response = await authClient.updateUser({ name: data.name });

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Update local state
      onProfileUpdate({
        ...user,
        name: data.name,
      });

      toast.success("Profile updated successfully", {
        description: "Your profile information has been saved.",
      });
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile", {
        description: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Profile Information</CardTitle>
        <CardDescription>Update your basic profile information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              label="Name"
              placeholder="Enter your name"
              {...register("name", {
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              })}
              error={errors.name?.message}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Input
              label="Email"
              placeholder="Enter your email"
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              error={errors.email?.message}
              disabled={true} // Email is typically read-only
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}