import { apiRequest } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import type { CalendarIntegrationStatus } from "@/shared/types/api";
export function getCalendarStatus() {
  return apiRequest<CalendarIntegrationStatus>(endpoints.admin.calendar, {
    auth: true,
  });
}
export function connectGoogleCalendar() {
  return apiRequest<{ authUrl: string }>(
    `${endpoints.admin.calendar}/google/connect`,
    { method: "POST", auth: true },
  );
}
export function disconnectCalendar() {
  return apiRequest<{ connected: false }>(endpoints.admin.calendar, {
    method: "DELETE",
    auth: true,
  });
}
