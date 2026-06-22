"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "./auth-provider";
import { BusinessProvider } from "./business-provider";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <BusinessProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </BusinessProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
