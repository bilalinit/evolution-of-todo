/**
 * AccountSettings Component
 *
 * Displays account information and provides logout functionality.
 */

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut, User, Calendar, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { User as UserType } from "@/types/user";
import { signOut } from "@/lib/auth/auth-client";

interface AccountSettingsProps {
  user: UserType;
  stats?: {
    total_tasks: number;
    completed_tasks: number;
    pending_tasks: number;
  };
}

export function AccountSettings({ user, stats }: AccountSettingsProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await signOut();
      toast.success("Logged out", {
        description: "You have been successfully logged out.",
      });
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed", {
        description: "Please try again.",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Account Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account Information</CardTitle>
          <CardDescription>Your account details and membership</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#5C4D45]" strokeWidth={2} />
              <span className="font-mono text-xs uppercase tracking-widest text-[#5C4D45]">
                Name
              </span>
            </div>
            <span className="font-sans text-[#2A1B12] font-medium">
              {user.name || "Not set"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#5C4D45]" strokeWidth={2} />
              <span className="font-mono text-xs uppercase tracking-widest text-[#5C4D45]">
                Email
              </span>
            </div>
            <span className="font-sans text-[#2A1B12] font-medium">
              {user.email}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#5C4D45]" strokeWidth={2} />
              <span className="font-mono text-xs uppercase tracking-widest text-[#5C4D45]">
                Member Since
              </span>
            </div>
            <span className="font-sans text-[#2A1B12] font-medium">
              {formatDate(user.created_at)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Task Statistics Card */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Task Statistics</CardTitle>
            <CardDescription>Your productivity overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="font-serif text-2xl font-bold text-[#2A1B12]">
                  {stats.total_tasks}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-[#5C4D45] mt-1">
                  Total
                </div>
              </div>
              <div>
                <div className="font-serif text-2xl font-bold text-[#FF6B4A]">
                  {stats.pending_tasks}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-[#5C4D45] mt-1">
                  Pending
                </div>
              </div>
              <div>
                <div className="font-serif text-2xl font-bold text-green-600">
                  {stats.completed_tasks}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-[#5C4D45] mt-1">
                  Completed
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Danger Zone Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Danger Zone</CardTitle>
          <CardDescription>Log out of your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-sans text-[#2A1B12] font-medium">
                Sign out of your account
              </p>
              <p className="font-sans text-sm text-[#5C4D45] mt-1">
                You will need to log in again to access your tasks.
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" strokeWidth={2} />
              {isLoggingOut ? "Signing out..." : "Sign Out"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}