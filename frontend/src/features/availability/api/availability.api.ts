import { apiRequest } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import type { AvailabilitySlot } from "@/shared/types/api";

export interface GetAvailabilityInput {
  serviceId: string;
  date: string;
}

export function getAvailability(input: GetAvailabilityInput) {
  const params = new URLSearchParams({
    serviceId: input.serviceId,
    date: input.date,
  });

  return apiRequest<AvailabilitySlot[]>(`${endpoints.availability}?${params.toString()}`);
}
