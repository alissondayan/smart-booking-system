import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api/query-keys";
import {
  cancelAdminAppointment,
  getAdminAppointment,
  listAdminAppointments,
  updateAdminAppointmentNotes,
  type AdminAppointmentFilters,
} from "../api/admin-appointments.api";

export function useAdminAppointments(filters: AdminAppointmentFilters = {}) {
  return useQuery({
    queryKey: queryKeys.appointments.admin(filters),
    queryFn: () => listAdminAppointments(filters),
  });
}
export function useAdminAppointment(id: string) {
  return useQuery({
    queryKey: queryKeys.appointments.adminDetail(id),
    queryFn: () => getAdminAppointment(id),
    enabled: Boolean(id),
  });
}
export function useCancelAdminAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cancelAdminAppointment,
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: ["appointments", "admin"] }),
  });
}
export function useUpdateAdminAppointmentNotes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      updateAdminAppointmentNotes(id, notes),
    onSuccess: (_, vars) => {
      void qc.invalidateQueries({ queryKey: ["appointments", "admin"] });
      void qc.invalidateQueries({
        queryKey: queryKeys.appointments.adminDetail(vars.id),
      });
    },
  });
}
