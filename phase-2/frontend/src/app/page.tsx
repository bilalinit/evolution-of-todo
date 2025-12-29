import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getSession } from "@/lib/auth/auth-client";

export const metadata: Metadata = {
  title: "Todo App",
  description: "Modern Todo Application with Authentication",
};

export default async function HomePage() {
  // Check if user is authenticated
  const session = await getSession();

  if (session) {
    // Redirect to dashboard if authenticated
    redirect("/tasks");
  }

  // Show landing page for unauthenticated users
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-2xl text-center space-y-8 animate-fade-in-up">
        {/* Hero Section */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground">
            Todo App
          </h1>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            A modern task management application built with Next.js, featuring secure authentication and real-time updates.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-6 text-left py-8">
          <div className="p-4 rounded-lg border border-border hover:border-foreground transition-colors">
            <h3 className="font-serif font-semibold text-lg mb-2">Secure Auth</h3>
            <p className="text-sm text-muted-foreground">
              JWT-based authentication with Better Auth
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border hover:border-foreground transition-colors">
            <h3 className="font-serif font-semibold text-lg mb-2">Real-time</h3>
            <p className="text-sm text-muted-foreground">
              Optimistic UI updates with React Query
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border hover:border-foreground transition-colors">
            <h3 className="font-serif font-semibold text-lg mb-2">Modern UI</h3>
            <p className="text-sm text-muted-foreground">
              Technical Editorial design system
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <a
            href="/signup"
            className="w-full sm:w-auto px-8 py-3 bg-accent text-white rounded-md font-medium hover:bg-[#ff856a] transition-colors hover:translate-y-[-1px] active:translate-y-0"
          >
            Get Started
          </a>
          <a
            href="/login"
            className="w-full sm:w-auto px-8 py-3 border border-border bg-transparent text-foreground rounded-md font-medium hover:bg-muted hover:border-foreground transition-colors"
          >
            Sign In
          </a>
        </div>

        {/* Tech Stack */}
        <div className="pt-8 text-sm text-muted-foreground">
          <p className="font-medium mb-2">Built with:</p>
          <div className="flex flex-wrap gap-3 justify-center opacity-75">
            <span>Next.js 16+</span>
            <span>•</span>
            <span>TypeScript</span>
            <span>•</span>
            <span>Tailwind CSS</span>
            <span>•</span>
            <span>Better Auth</span>
            <span>•</span>
            <span>React Query</span>
          </div>
        </div>
      </div>
    </main>
  );
}
