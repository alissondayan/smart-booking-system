import type { Appointment, Service } from "@/shared/types/api";

export interface AppointmentViewModel {
  id: string;
  serviceId: string;
  serviceName: string;
  startAt: string;
  endAt: string;
  status: Appointment["status"];
  notes?: string | null;
}

export function toAppointmentViewModel(appointment: Appointment, services: Service[]): AppointmentViewModel {
  const service = services.find((item) => item.id === appointment.serviceId);

  return {
    id: appointment.id,
    serviceId: appointment.serviceId,
    serviceName: service?.name ?? "Service",
    startAt: appointment.startAt,
    endAt: appointment.endAt,
    status: appointment.status,
    notes: appointment.notes,
  };
}

export function sortAppointmentsByStart(appointments: Appointment[]): Appointment[] {
  return [...appointments].sort((first, second) => new Date(first.startAt).getTime() - new Date(second.startAt).getTime());
}

/** Mirrors the backend guard: only confirmed appointments that have not started yet can move. */
export function isAppointmentReschedulable(appointment: AppointmentViewModel): boolean {
  return appointment.status === "CONFIRMED" && new Date(appointment.startAt).getTime() > Date.now();
}
