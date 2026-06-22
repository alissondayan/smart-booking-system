import { apiRequest } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import type { WaitlistEntry } from "@/shared/types/api";

export interface JoinWaitlistInput {
  serviceId: string;
  preferredDate?: string;
}

export function joinWaitlist(input: JoinWaitlistInput) {
  return apiRequest<WaitlistEntry>(endpoints.waitlist, {
    method: "POST",
    auth: true,
    body: input,
  });
}

export function listMyWaitlist() {
  return apiRequest<WaitlistEntry[]>(endpoints.myWaitlist, {
    auth: true,
  });
}

export function cancelMyWaitlistEntry(entryId: string) {
  return apiRequest<WaitlistEntry>(`${endpoints.myWaitlist}/${entryId}`, {
    method: "DELETE",
    auth: true,
  });
}
