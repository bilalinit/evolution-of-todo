/**
 * Providers Component
 *
 * Wraps the application with React Query Provider and Sonner Toast Provider.
 */

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        richColors
        expand
        visibleToasts={5}
        toastOptions={{
          style: {
            background: "var(--color-background)",
            border: "1px solid var(--color-border)",
            color: "var(--color-foreground)",
          },
        }}
      />
    </QueryClientProvider>
  );
}