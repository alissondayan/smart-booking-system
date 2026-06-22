import { apiRequest } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import type { Service } from "@/shared/types/api";

export interface ServicePayload {
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  isActive?: boolean;
  sortOrder?: number;
}

export function listAdminServices() {
  return apiRequest<Service[]>(endpoints.admin.services, { auth: true });
}

export function createAdminService(input: ServicePayload) {
  return apiRequest<Service>(endpoints.admin.services, {
    method: "POST",
    auth: true,
    body: input,
  });
}

export function updateAdminService(
  serviceId: string,
  input: Partial<ServicePayload>,
) {
  return apiRequest<Service>(`${endpoints.admin.services}/${serviceId}`, {
    method: "PATCH",
    auth: true,
    body: input,
  });
}

export function deactivateAdminService(serviceId: string) {
  return apiRequest<Service>(`${endpoints.admin.services}/${serviceId}`, {
    method: "DELETE",
    auth: true,
  });
}
