import {
  AppointmentEmailTemplateData,
  escapeHtml,
} from './booking-confirmation.template';

export function cancellationConfirmationTemplate(
  data: AppointmentEmailTemplateData,
): string {
  return `
    <h1>Appointment cancelled</h1>
    <p>Hello ${escapeHtml(data.customerName)},</p>
    <p>Your appointment for <strong>${escapeHtml(data.serviceName)}</strong> was cancelled.</p>
    <p>Original start: ${data.startAt.toISOString()}</p>
    <p>Original end: ${data.endAt.toISOString()}</p>
  `;
}
