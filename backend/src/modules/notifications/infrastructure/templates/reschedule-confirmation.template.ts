import { escapeHtml } from './booking-confirmation.template';
import { formatAppointmentTime } from './waitlist-slot-available.template';

export interface RescheduleConfirmationTemplateData {
  customerName: string;
  serviceName: string;
  previousStartAt: Date;
  previousEndAt: Date;
  startAt: Date;
  endAt: Date;
  timeZone: string;
}

export function rescheduleConfirmationTemplate(
  data: RescheduleConfirmationTemplateData,
): string {
  const serviceName = escapeHtml(data.serviceName);
  const timeZone = escapeHtml(data.timeZone);
  const previousRange = formatRange(
    data.previousStartAt,
    data.previousEndAt,
    data.timeZone,
  );
  const newRange = formatRange(data.startAt, data.endAt, data.timeZone);

  return `
    <h1>Appointment rescheduled</h1>
    <p>Hello ${escapeHtml(data.customerName)},</p>
    <p>Your appointment for <strong>${serviceName}</strong> was rescheduled.</p>
    <p>Previous time: ${previousRange} (${timeZone})</p>
    <p>New time: ${newRange} (${timeZone})</p>
  `;
}

function formatRange(startAt: Date, endAt: Date, timeZone: string): string {
  return `${escapeHtml(formatAppointmentTime(startAt, timeZone))} – ${escapeHtml(formatAppointmentTime(endAt, timeZone))}`;
}
