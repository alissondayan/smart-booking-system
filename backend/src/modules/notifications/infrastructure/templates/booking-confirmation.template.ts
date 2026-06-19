export interface AppointmentEmailTemplateData {
  customerName: string;
  serviceName: string;
  startAt: Date;
  endAt: Date;
}

export function bookingConfirmationTemplate(
  data: AppointmentEmailTemplateData,
): string {
  return `
    <h1>Appointment confirmed</h1>
    <p>Hello ${escapeHtml(data.customerName)},</p>
    <p>Your appointment for <strong>${escapeHtml(data.serviceName)}</strong> is confirmed.</p>
    <p>Start: ${data.startAt.toISOString()}</p>
    <p>End: ${data.endAt.toISOString()}</p>
  `;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
