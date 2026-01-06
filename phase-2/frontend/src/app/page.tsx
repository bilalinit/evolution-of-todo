import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getSession } from "@/lib/auth/auth-client";
import { Hero, Features, CTA } from "@/components/sections";
import { HomeNavbar } from "@/components/layout/HomeNavbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "PlanStack - Focus on What Matters",
  description: "A modern task management platform designed for clarity and productivity. Focus on what matters, sync instantly across devices, and stay secure by default.",
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
    <div className="min-h-screen bg-background flex flex-col">
      <HomeNavbar />
      <main className="flex-grow">
        <Hero />
        <Features />

        <CTA />
      </main>
      <Footer />
    </div>
  );
}
