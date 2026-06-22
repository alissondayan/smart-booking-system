import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api/query-keys";
import { getAvailability } from "../api/availability.api";

export function useAvailability(serviceId: string, date: string) {
  return useQuery({
    queryKey: queryKeys.availability.slots(serviceId, date),
    queryFn: () => getAvailability({ serviceId, date }),
    enabled: Boolean(serviceId && date),
    staleTime: 15_000,
  });
}
