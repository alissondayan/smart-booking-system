import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api/query-keys";
import {
  createAdminService,
  deactivateAdminService,
  listAdminServices,
  updateAdminService,
  type ServicePayload,
} from "../api/admin-services.api";

export function useAdminServices() {
  return useQuery({
    queryKey: queryKeys.adminServices.all(),
    queryFn: listAdminServices,
  });
}

export function useCreateAdminService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ServicePayload) => createAdminService(input),
    onSuccess: () =>
      void queryClient.invalidateQueries({
        queryKey: queryKeys.adminServices.all(),
      }),
  });
}

export function useUpdateAdminService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      serviceId,
      input,
    }: {
      serviceId: string;
      input: Partial<ServicePayload>;
    }) => updateAdminService(serviceId, input),
    onSuccess: () =>
      void queryClient.invalidateQueries({
        queryKey: queryKeys.adminServices.all(),
      }),
  });
}

export function useDeactivateAdminService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deactivateAdminService,
    onSuccess: () =>
      void queryClient.invalidateQueries({
        queryKey: queryKeys.adminServices.all(),
      }),
  });
}
