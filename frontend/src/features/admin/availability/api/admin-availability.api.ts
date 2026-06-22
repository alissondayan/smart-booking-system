import { apiRequest } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import type {
  AvailabilityRule,
  BlockedTime,
  DateAvailability,
  Holiday,
} from "@/shared/types/api";

export interface AvailabilityRulePayload {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive?: boolean;
}

export function listAvailabilityRules() {
  return apiRequest<AvailabilityRule[]>(endpoints.admin.availabilityRules, {
    auth: true,
  });
}

export function replaceAvailabilityRules(rules: AvailabilityRulePayload[]) {
  return apiRequest<AvailabilityRule[]>(endpoints.admin.availabilityRules, {
    method: "PUT",
    auth: true,
    body: { rules },
  });
}

export function listDateOverrides() {
  return apiRequest<DateAvailability[]>(endpoints.admin.availabilityDates, {
    auth: true,
  });
}

export function setDateOverride(
  date: string,
  input: { startTime: string; endTime: string; isClosed?: boolean },
) {
  return apiRequest<DateAvailability>(
    `${endpoints.admin.availabilityDates}/${date}`,
    { method: "PUT", auth: true, body: input },
  );
}

export function deleteDateOverride(date: string) {
  return apiRequest<{ success: true }>(
    `${endpoints.admin.availabilityDates}/${date}`,
    { method: "DELETE", auth: true },
  );
}

export function listBlockedTimes() {
  return apiRequest<BlockedTime[]>(endpoints.admin.blockedTimes, {
    auth: true,
  });
}

export function createBlockedTime(input: {
  startAt: string;
  endAt: string;
  reason?: string;
}) {
  return apiRequest<BlockedTime>(endpoints.admin.blockedTimes, {
    method: "POST",
    auth: true,
    body: input,
  });
}

export function deleteBlockedTime(id: string) {
  return apiRequest<{ success: true }>(
    `${endpoints.admin.blockedTimes}/${id}`,
    { method: "DELETE", auth: true },
  );
}

export function listHolidays() {
  return apiRequest<Holiday[]>(endpoints.admin.holidays, { auth: true });
}

export function createHoliday(input: { date: string; label?: string }) {
  return apiRequest<Holiday>(endpoints.admin.holidays, {
    method: "POST",
    auth: true,
    body: input,
  });
}

export function deleteHoliday(id: string) {
  return apiRequest<{ success: true }>(`${endpoints.admin.holidays}/${id}`, {
    method: "DELETE",
    auth: true,
  });
}
