import { escapeHtml } from './booking-confirmation.template';

export interface WaitlistSlotAvailableTemplateData {
  customerName: string;
  serviceName: string;
  startAt: Date;
  endAt: Date;
  timeZone: string;
  bookingUrl: string;
}

export function waitlistSlotAvailableTemplate(
  data: WaitlistSlotAvailableTemplateData,
): string {
  const serviceName = escapeHtml(data.serviceName);
  const bookingUrl = escapeHtml(data.bookingUrl);

  return `
    <h1>A time opened for ${serviceName}</h1>
    <p>Hello ${escapeHtml(data.customerName)},</p>
    <p>A time became available for <strong>${serviceName}</strong>.</p>
    <p>Opened time: ${escapeHtml(formatAppointmentTime(data.startAt, data.timeZone))} – ${escapeHtml(formatAppointmentTime(data.endAt, data.timeZone))} (${escapeHtml(data.timeZone)})</p>
    <p><strong>This slot is not reserved for you.</strong> It is available to the first customer who books it.</p>
    <p><a href="${bookingUrl}">Book this service</a></p>
  `;
}

export function formatAppointmentTime(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone,
  }).format(date);
}
