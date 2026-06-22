import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api/query-keys";
import {
  updateBusiness,
  uploadBusinessLogo,
  type BusinessPayload,
} from "../api/admin-business.api";
export function useUpdateBusiness() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: BusinessPayload) => updateBusiness(input),
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: queryKeys.business.profile() }),
  });
}
export function useUploadBusinessLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: uploadBusinessLogo,
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: queryKeys.business.profile() }),
  });
}
