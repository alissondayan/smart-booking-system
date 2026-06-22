import { apiRequest } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import type { Service } from "@/shared/types/api";

export function listServices() {
  return apiRequest<Service[]>(endpoints.services);
}

export function getService(serviceId: string) {
  return apiRequest<Service>(`${endpoints.services}/${serviceId}`);
}
