/**
 * Dashboard Layout
 *
 * Protected layout for authenticated users.
 * Includes header with navigation and logout.
 */

import { AuthGuard } from "@/components/auth/AuthGuard";
import { Header } from "@/components/layout/Header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - Todo App",
  description: "Manage your tasks in the Todo App dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}