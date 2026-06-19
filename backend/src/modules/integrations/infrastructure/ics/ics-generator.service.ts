import { Injectable } from '@nestjs/common';
import { CalendarAppointment } from '../../domain/ports/calendar.port';

@Injectable()
export class IcsGeneratorService {
  generate(appointment: CalendarAppointment): string {
    const now = this.formatDate(new Date());

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Smart Booking System//Backend v1//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${appointment.id}@smart-booking-system`,
      `DTSTAMP:${now}`,
      `DTSTART:${this.formatDate(appointment.startAt)}`,
      `DTEND:${this.formatDate(appointment.endAt)}`,
      `SUMMARY:${this.escape(appointment.serviceName)}`,
      `DESCRIPTION:${this.escape(`Appointment at ${appointment.businessName}`)}`,
      'END:VEVENT',
      'END:VCALENDAR',
      '',
    ].join('\r\n');
  }

  private formatDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  }

  private escape(value: string): string {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  }
}
