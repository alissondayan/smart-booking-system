import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api/query-keys";
import {
  listAdminWaitlist,
  type AdminWaitlistFilters,
} from "../api/admin-waitlist.api";
export function useAdminWaitlist(filters: AdminWaitlistFilters = {}) {
  return useQuery({
    queryKey: queryKeys.waitlist.admin(filters),
    queryFn: () => listAdminWaitlist(filters),
  });
}
