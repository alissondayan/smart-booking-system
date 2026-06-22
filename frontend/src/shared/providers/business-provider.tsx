"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ResolvedBusinessConfig } from "@/config/business-config.schema";
import { getResolvedBusinessConfig } from "@/features/business/configuration/services/business-config.service";

const BusinessContext = createContext<ResolvedBusinessConfig | null>(null);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const config = getResolvedBusinessConfig();

  return <BusinessContext.Provider value={config}>{children}</BusinessContext.Provider>;
}

export function useBusinessConfig() {
  const context = useContext(BusinessContext);

  if (!context) {
    throw new Error("useBusinessConfig must be used within BusinessProvider");
  }

  return context;
}
