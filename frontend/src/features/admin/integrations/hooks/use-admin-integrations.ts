import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api/query-keys";
import {
  connectGoogleCalendar,
  disconnectCalendar,
  getCalendarStatus,
} from "../api/admin-integrations.api";
export function useCalendarStatus() {
  return useQuery({
    queryKey: queryKeys.integrations.calendar(),
    queryFn: getCalendarStatus,
  });
}
export function useConnectGoogleCalendar() {
  return useMutation({ mutationFn: connectGoogleCalendar });
}
export function useDisconnectCalendar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: disconnectCalendar,
    onSuccess: () =>
      void qc.invalidateQueries({
        queryKey: queryKeys.integrations.calendar(),
      }),
  });
}
