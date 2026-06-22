import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api/query-keys";
import {
  getAdminCustomer,
  listAdminCustomers,
  type CustomerFilters,
} from "../api/admin-customers.api";
export function useAdminCustomers(filters: CustomerFilters = {}) {
  return useQuery({
    queryKey: queryKeys.customers.admin(filters),
    queryFn: () => listAdminCustomers(filters),
  });
}
export function useAdminCustomer(id: string) {
  return useQuery({
    queryKey: queryKeys.customers.detail(id),
    queryFn: () => getAdminCustomer(id),
    enabled: Boolean(id),
  });
}
