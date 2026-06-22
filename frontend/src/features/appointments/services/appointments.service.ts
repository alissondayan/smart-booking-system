import type { Appointment, Service } from "@/shared/types/api";

export interface AppointmentViewModel {
  id: string;
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
