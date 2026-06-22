import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api/query-keys";
import { getBusinessProfile } from "../api/business-profile.api";

export function useBusinessProfile() {
  return useQuery({
    queryKey: queryKeys.business.profile(),
    queryFn: getBusinessProfile,
    retry: false,
  });
}
