/**
 * Profile Page
 *
 * User profile management page.
 * Uses session data directly from Better Auth instead of a separate API call.
 */

"use client";

import * as React from "react";
import { useSession } from "@/lib/auth/hooks";
import { useTaskStats } from "@/hooks/useTasks";
import { redirect, useRouter } from "next/navigation";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { PasswordChangeForm } from "@/components/profile/PasswordChangeForm";
import { AccountSettings } from "@/components/profile/AccountSettings";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ProfilePage() {
  const router = useRouter();
  const { session, isLoading: sessionLoading } = useSession();

  // Get user ID for stats query
  const userId = session?.user?.id || '';
  const { data: taskStats } = useTaskStats(userId);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!sessionLoading && !session) {
      redirect("/login");
    }
  }, [session, sessionLoading]);

  // Loading state
  if (sessionLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Map session user to the format components expect
  const user = {
    id: session.user.id,
    name: session.user.name || "",
    email: session.user.email,
    created_at: (session.user as any).createdAt?.toISOString?.()
      || (session.user as any).created_at
      || new Date().toISOString(),
  };

  const handleProfileUpdate = (updatedUser: any) => {
    // Refresh the page to update session data
    router.refresh();
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#2A1B12]">
            Profile Settings
          </h1>
          <p className="font-sans text-[#5C4D45] mt-1">
            Manage your account information and preferences
          </p>
        </div>
      </div>

      {/* Profile Layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column: Forms */}
        <div className="space-y-6">
          <ProfileForm
            user={user}
            onProfileUpdate={handleProfileUpdate}
          />
          <PasswordChangeForm userId={user.id} />
        </div>

        {/* Right Column: Account Settings with Task Stats */}
        <div className="space-y-6">
          <AccountSettings
            user={user}
            stats={taskStats ? {
              total_tasks: taskStats.total,
              completed_tasks: taskStats.completed,
              pending_tasks: taskStats.pending,
            } : undefined}
          />
        </div>
      </div>
    </div>
  );
}