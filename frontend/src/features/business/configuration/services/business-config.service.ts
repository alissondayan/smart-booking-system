import type { BusinessProfile } from "@/shared/types/api";
import { defaultBusinessConfig } from "@/config/business-config";
import { resolveBusinessConfig } from "../resolver";

export function getResolvedBusinessConfig(profile?: BusinessProfile | null) {
  return resolveBusinessConfig(defaultBusinessConfig, profile);
}
