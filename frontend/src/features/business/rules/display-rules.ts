import type { ResolvedBusinessConfig } from "@/config/business-config.schema";

export function shouldShowServicePrices(config: ResolvedBusinessConfig): boolean {
  return config.services.showPrices;
}

export function shouldShowServiceDuration(config: ResolvedBusinessConfig): boolean {
  return config.services.showDuration;
}
