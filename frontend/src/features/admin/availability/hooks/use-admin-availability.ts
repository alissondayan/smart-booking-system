import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api/query-keys";
import {
  createBlockedTime,
  createHoliday,
  deleteBlockedTime,
  deleteDateOverride,
  deleteHoliday,
  listAvailabilityRules,
  listBlockedTimes,
  listDateOverrides,
  listHolidays,
  replaceAvailabilityRules,
  setDateOverride,
  type AvailabilityRulePayload,
} from "../api/admin-availability.api";

export function useAvailabilityRules() {
  return useQuery({
    queryKey: queryKeys.adminAvailability.rules(),
    queryFn: listAvailabilityRules,
  });
}
export function useDateOverrides() {
  return useQuery({
    queryKey: queryKeys.adminAvailability.dates(),
    queryFn: listDateOverrides,
  });
}
export function useBlockedTimes() {
  return useQuery({
    queryKey: queryKeys.adminAvailability.blockedTimes(),
    queryFn: listBlockedTimes,
  });
}
export function useHolidays() {
  return useQuery({
    queryKey: queryKeys.adminAvailability.holidays(),
    queryFn: listHolidays,
  });
}

export function useReplaceAvailabilityRules() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rules: AvailabilityRulePayload[]) =>
      replaceAvailabilityRules(rules),
    onSuccess: () =>
      void qc.invalidateQueries({
        queryKey: queryKeys.adminAvailability.rules(),
      }),
  });
}

export function useSetDateOverride() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      date,
      input,
    }: {
      date: string;
      input: { startTime: string; endTime: string; isClosed?: boolean };
    }) => setDateOverride(date, input),
    onSuccess: () =>
      void qc.invalidateQueries({
        queryKey: queryKeys.adminAvailability.dates(),
      }),
  });
}

export function useDeleteDateOverride() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteDateOverride,
    onSuccess: () =>
      void qc.invalidateQueries({
        queryKey: queryKeys.adminAvailability.dates(),
      }),
  });
}

export function useCreateBlockedTime() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createBlockedTime,
    onSuccess: () =>
      void qc.invalidateQueries({
        queryKey: queryKeys.adminAvailability.blockedTimes(),
      }),
  });
}

export function useDeleteBlockedTime() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteBlockedTime,
    onSuccess: () =>
      void qc.invalidateQueries({
        queryKey: queryKeys.adminAvailability.blockedTimes(),
      }),
  });
}

export function useCreateHoliday() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createHoliday,
    onSuccess: () =>
      void qc.invalidateQueries({
        queryKey: queryKeys.adminAvailability.holidays(),
      }),
  });
}

export function useDeleteHoliday() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteHoliday,
    onSuccess: () =>
      void qc.invalidateQueries({
        queryKey: queryKeys.adminAvailability.holidays(),
      }),
  });
}
