/**
 * Header Component
 *
 * Navigation header for the dashboard.
 * Shows user info and logout button.
 */

"use client";

import Link from "next/link";
import { useAuth, useSession } from "@/lib/auth/hooks";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

export function Header() {
  const { user } = useSession();
  const { signOut, isSigningOut } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    await signOut();
    setShowMenu(false);
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo / Home Link */}
        <Link
          href="/tasks"
          className="text-xl font-serif font-bold text-foreground hover:text-accent transition-colors"
        >
          Todo App
        </Link>

        {/* Navigation and User Menu */}
        <div className="flex items-center gap-4">
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/tasks"
              className="text-sm font-medium text-foreground hover:text-accent transition-colors"
            >
              Tasks
            </Link>
            <Link
              href="/profile"
              className="text-sm font-medium text-foreground hover:text-accent transition-colors"
            >
              Profile
            </Link>
          </nav>

          {/* User Menu */}
          {user && (
            <div className="relative">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2"
              >
                <span className="hidden sm:inline">{user.name || "User"}</span>
                <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold">
                  {(user.name || "U").charAt(0).toUpperCase()}
                </span>
              </Button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg py-2 animate-fade-in-up">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    disabled={isSigningOut}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    {isSigningOut ? "Signing out..." : "Logout"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-border bg-background">
        <nav className="container mx-auto px-4 py-2 flex gap-4">
          <Link
            href="/tasks"
            className="text-sm font-medium text-foreground hover:text-accent transition-colors py-2"
          >
            Tasks
          </Link>
          <Link
            href="/profile"
            className="text-sm font-medium text-foreground hover:text-accent transition-colors py-2"
          >
            Profile
          </Link>
        </nav>
      </div>
    </header>
  );
}