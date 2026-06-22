import { apiRequest } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import type { BusinessProfile } from "@/shared/types/api";
export interface BusinessPayload {
  name: string;
  description?: string;
  phone: string;
  email: string;
  address?: string;
  website?: string;
  timezone?: string;
  socialLinks?: Record<string, string>;
}
export function updateBusiness(input: BusinessPayload) {
  return apiRequest<BusinessProfile>(endpoints.business, {
    method: "PUT",
    auth: true,
    body: input,
  });
}
export function uploadBusinessLogo(file: File) {
  const form = new FormData();
  form.set("file", file);
  return apiRequest<BusinessProfile>(`${endpoints.business}/logo`, {
    method: "POST",
    auth: true,
    body: form,
  });
}
