"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ResolvedBusinessConfig } from "@/config/business-config.schema";
import { getResolvedBusinessConfig } from "@/features/business/configuration/services/business-config.service";
import { useBusinessProfile } from "@/features/business/profile/hooks/use-business-profile";
import { EmptyState } from "@/shared/ui/empty-state";

const BusinessContext = createContext<ResolvedBusinessConfig | null>(null);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const businessProfile = useBusinessProfile();
  const config = getResolvedBusinessConfig(businessProfile.data);

  // Appointment times are formatted in config.resolved.timezone. Until the
  // profile resolves, that falls back to the platform default rather than the
  // business timezone, so rendering now would show slots in the wrong zone.
  if (businessProfile.isPending) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-12">
        <EmptyState title="Loading" description="Preparing your booking experience." />
      </main>
    );
  }

  return <BusinessContext.Provider value={config}>{children}</BusinessContext.Provider>;
}

export function useBusinessConfig() {
  const context = useContext(BusinessContext);

  if (!context) {
    throw new Error("useBusinessConfig must be used within BusinessProvider");
  }

  return context;
}
