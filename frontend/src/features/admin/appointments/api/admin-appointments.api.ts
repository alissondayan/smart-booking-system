import { apiRequest } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import type { Appointment, AppointmentStatus } from "@/shared/types/api";

export interface AdminAppointmentFilters {
  status?: AppointmentStatus;
  date?: string;
  from?: string;
  to?: string;
}

function toQuery(filters: AdminAppointmentFilters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.date) params.set("date", filters.date);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  return params.toString();
}

export function listAdminAppointments(filters: AdminAppointmentFilters = {}) {
  const query = toQuery(filters);
  return apiRequest<Appointment[]>(
    `${endpoints.admin.appointments}${query ? `?${query}` : ""}`,
    { auth: true },
  );
}
export function getAdminAppointment(id: string) {
  return apiRequest<Appointment>(`${endpoints.admin.appointments}/${id}`, {
    auth: true,
  });
}
export function cancelAdminAppointment(id: string) {
  return apiRequest<Appointment>(
    `${endpoints.admin.appointments}/${id}/cancel`,
    { method: "PATCH", auth: true },
  );
}
export function updateAdminAppointmentNotes(id: string, notes?: string) {
  return apiRequest<Appointment>(
    `${endpoints.admin.appointments}/${id}/notes`,
    { method: "PATCH", auth: true, body: { notes } },
  );
}
