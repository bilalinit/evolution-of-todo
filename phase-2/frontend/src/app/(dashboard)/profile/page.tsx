/**
 * Profile Page
 *
 * User profile management page.
 */

"use client";

import * as React from "react";
import { useSession } from "@/lib/auth/hooks";
import { redirect, useRouter } from "next/navigation";
import { useProfile, useUpdateProfile, useChangePassword } from "@/hooks/useProfile";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { PasswordChangeForm } from "@/components/profile/PasswordChangeForm";
import { AccountSettings } from "@/components/profile/AccountSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ProfilePage() {
  const router = useRouter();
  const { session, isLoading: sessionLoading } = useSession();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!sessionLoading && !session) {
      redirect("/login");
    }
  }, [session, sessionLoading]);

  // Get user ID from session
  const userId = session?.user?.id || "";

  // Fetch profile data
  const {
    data: profileData,
    isLoading: profileLoading,
    isError: profileError,
  } = useProfile(userId);

  // Loading state
  if (sessionLoading || profileLoading) {
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

  if (!session || !profileData) {
    return null;
  }

  const handleProfileUpdate = (updatedUser: any) => {
    // The hook handles cache updates, this is just for any additional logic
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
            user={profileData.user}
            onProfileUpdate={handleProfileUpdate}
          />
          <PasswordChangeForm userId={userId} />
        </div>

        {/* Right Column: Account Settings & Stats */}
        <div className="space-y-6">
          <AccountSettings
            user={profileData.user}
            stats={profileData.stats}
          />
        </div>
      </div>
    </div>
  );
}