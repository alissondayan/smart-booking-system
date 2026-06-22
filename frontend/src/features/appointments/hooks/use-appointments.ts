import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api/query-keys";
import {
  bookAppointment,
  cancelMyAppointment,
  getMyAppointment,
  listMyAppointments,
  rescheduleMyAppointment,
  type BookAppointmentInput,
  type ListMyAppointmentsInput,
} from "../api/appointments.api";

export function useMyAppointments(input: ListMyAppointmentsInput = {}) {
  return useQuery({
    queryKey: [...queryKeys.appointments.mine(), input],
    queryFn: () => listMyAppointments(input),
  });
}

export function useMyAppointment(appointmentId: string) {
  return useQuery({
    queryKey: [...queryKeys.appointments.mine(), appointmentId],
    queryFn: () => getMyAppointment(appointmentId),
    enabled: Boolean(appointmentId),
  });
}

export function useBookAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: BookAppointmentInput) => bookAppointment(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.appointments.mine() });
    },
  });
}

export function useCancelMyAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelMyAppointment,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.appointments.mine() });
    },
  });
}

export function useRescheduleMyAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appointmentId, newStartAt }: { appointmentId: string; newStartAt: string }) =>
      rescheduleMyAppointment(appointmentId, newStartAt),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.appointments.mine() });
    },
  });
}
