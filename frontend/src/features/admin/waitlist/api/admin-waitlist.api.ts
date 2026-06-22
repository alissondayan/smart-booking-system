import { apiRequest } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import type { WaitlistEntry, WaitlistStatus } from "@/shared/types/api";
export interface AdminWaitlistFilters {
  serviceId?: string;
  status?: WaitlistStatus;
}
export function listAdminWaitlist(filters: AdminWaitlistFilters = {}) {
  const p = new URLSearchParams();
  if (filters.serviceId) p.set("serviceId", filters.serviceId);
  if (filters.status) p.set("status", filters.status);
  const q = p.toString();
  return apiRequest<WaitlistEntry[]>(
    `${endpoints.admin.waitlist}${q ? `?${q}` : ""}`,
    { auth: true },
  );
}
