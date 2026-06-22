import type { ResolvedBusinessConfig } from "@/config/business-config.schema";

export function canPreviewAvailability(config: ResolvedBusinessConfig): boolean {
  return config.booking.allowGuestAvailabilityPreview;
}

export function requiresAuthBeforeConfirmation(config: ResolvedBusinessConfig): boolean {
  return config.booking.requireAuthBeforeConfirmation;
}
