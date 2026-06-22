import { apiRequest } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import type {
  CustomerDetails,
  CustomerSummary,
  PaginatedResponse,
} from "@/shared/types/api";

export interface CustomerFilters {
  search?: string;
  page?: number;
  limit?: number;
}
function toQuery(filters: CustomerFilters = {}) {
  const p = new URLSearchParams();
  if (filters.search) p.set("search", filters.search);
  if (filters.page) p.set("page", String(filters.page));
  if (filters.limit) p.set("limit", String(filters.limit));
  return p.toString();
}
export function listAdminCustomers(filters: CustomerFilters = {}) {
  const q = toQuery(filters);
  return apiRequest<PaginatedResponse<CustomerSummary>>(
    `${endpoints.admin.customers}${q ? `?${q}` : ""}`,
    { auth: true },
  );
}
export function getAdminCustomer(id: string) {
  return apiRequest<CustomerDetails>(`${endpoints.admin.customers}/${id}`, {
    auth: true,
  });
}
