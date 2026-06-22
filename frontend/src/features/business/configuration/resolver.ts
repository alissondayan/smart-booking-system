import type { BusinessProfile } from "@/shared/types/api";
import type { BusinessPlatformConfig, BusinessThemeTokens, ResolvedBusinessConfig } from "@/config/business-config.schema";

const radiusByToken: Record<BusinessPlatformConfig["theme"]["borderRadius"], string> = {
  none: "0",
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
};

export function createThemeTokens(config: BusinessPlatformConfig): BusinessThemeTokens {
  return {
    background: config.theme.backgroundColor ?? "#ffffff",
    foreground: config.theme.textColor ?? "#111827",
    muted: "#f3f4f6",
    mutedForeground: "#6b7280",
    border: "#e5e7eb",
    primary: config.theme.primaryColor,
    primaryForeground: "#ffffff",
    radius: radiusByToken[config.theme.borderRadius],
    fontFamily: config.theme.fontFamily ?? "Arial, Helvetica, sans-serif",
  };
}

export function resolveBusinessConfig(config: BusinessPlatformConfig, profile?: BusinessProfile | null): ResolvedBusinessConfig {
  return {
    ...config,
    resolved: {
      name: profile?.name ?? config.identity.fallbackName,
      logoUrl: profile?.logoUrl ?? config.identity.fallbackLogoUrl,
      description: profile?.description ?? config.content.heroSubtitle,
      phone: profile?.phone,
      email: profile?.email,
      address: profile?.address ?? undefined,
      website: profile?.website ?? undefined,
      socialLinks: profile?.socialLinks ?? undefined,
      timezone: profile?.timezone ?? config.booking.defaultTimezone ?? "UTC",
    },
    themeTokens: createThemeTokens(config),
  };
}
