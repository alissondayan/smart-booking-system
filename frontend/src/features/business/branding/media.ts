import type { ResolvedBusinessConfig } from "@/config/business-config.schema";

export function getBusinessLogoUrl(config: ResolvedBusinessConfig): string | undefined {
  return config.resolved.logoUrl;
}
