/**
 * Public Layout
 *
 * Layout for public routes (landing page, auth pages).
 * Includes HomeNavbar and Footer.
 */

import { ReactNode } from "react";
import { HomeNavbar } from "@/components/layout/HomeNavbar";
import { Footer } from "@/components/layout/Footer";

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HomeNavbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}