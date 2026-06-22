import type { AvailabilitySlot } from "@/shared/types/api";
import { formatDateTime } from "@/shared/lib/date-time";

export function getDefaultBookingDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatSlotRange(slot: AvailabilitySlot, timeZone: string): string {
  return `${formatDateTime(slot.startAt, timeZone)} - ${formatDateTime(slot.endAt, timeZone)}`;
}
