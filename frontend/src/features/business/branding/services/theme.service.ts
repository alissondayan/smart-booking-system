import type { ResolvedBusinessConfig } from "@/config/business-config.schema";
import { toCssVariables } from "../theme-tokens";

export function getThemeStyle(config: ResolvedBusinessConfig): Record<string, string> {
  return toCssVariables(config.themeTokens);
}
