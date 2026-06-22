import { apiRequest } from "@/shared/api/client";
import type { BusinessProfile } from "@/shared/types/api";

export function getBusinessProfile() {
  return apiRequest<BusinessProfile>("/business");
}
