import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api/query-keys";
import { getService, listServices } from "../api/services.api";

export function useServices() {
  return useQuery({
    queryKey: queryKeys.services.all(),
    queryFn: listServices,
  });
}

export function useService(serviceId: string) {
  return useQuery({
    queryKey: queryKeys.services.detail(serviceId),
    queryFn: () => getService(serviceId),
    enabled: Boolean(serviceId),
  });
}
