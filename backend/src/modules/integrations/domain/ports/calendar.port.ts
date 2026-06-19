export const CALENDAR_PORT = Symbol('CALENDAR_PORT');

export interface CalendarAppointment {
  id: string;
  serviceName: string;
  businessName: string;
  startAt: Date;
  endAt: Date;
}

export interface CalendarPort {
  createEvent(appointment: CalendarAppointment): Promise<string>;
  updateEvent(eventId: string, appointment: CalendarAppointment): Promise<void>;
  deleteEvent(eventId: string): Promise<void>;
}
