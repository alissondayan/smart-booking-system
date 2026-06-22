import { apiRequest } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import type { Appointment, AppointmentStatus } from "@/shared/types/api";

export interface BookAppointmentInput {
  serviceId: string;
  startAt: string;
  notes?: string;
}

export interface ListMyAppointmentsInput {
  status?: AppointmentStatus;
  from?: string;
  to?: string;
}

export function bookAppointment(input: BookAppointmentInput) {
  return apiRequest<Appointment>(endpoints.appointments, {
    method: "POST",
    auth: true,
    body: input,
  });
}

export function listMyAppointments(input: ListMyAppointmentsInput = {}) {
  const params = new URLSearchParams();

  if (input.status) params.set("status", input.status);
  if (input.from) params.set("from", input.from);
  if (input.to) params.set("to", input.to);

  const query = params.toString();

  return apiRequest<Appointment[]>(`${endpoints.myAppointments}${query ? `?${query}` : ""}`, {
    auth: true,
  });
}

export function getMyAppointment(appointmentId: string) {
  return apiRequest<Appointment>(`${endpoints.myAppointments}/${appointmentId}`, {
    auth: true,
  });
}

export function cancelMyAppointment(appointmentId: string) {
  return apiRequest<Appointment>(`${endpoints.myAppointments}/${appointmentId}/cancel`, {
    method: "PATCH",
    auth: true,
  });
}

export function rescheduleMyAppointment(appointmentId: string, newStartAt: string) {
  return apiRequest<Appointment>(`${endpoints.myAppointments}/${appointmentId}/reschedule`, {
    method: "PATCH",
    auth: true,
    body: { newStartAt },
  });
}
