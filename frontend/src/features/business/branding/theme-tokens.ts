import type { BusinessThemeTokens } from "@/config/business-config.schema";

export function toCssVariables(tokens: BusinessThemeTokens): Record<string, string> {
  return {
    "--color-background": tokens.background,
    "--color-foreground": tokens.foreground,
    "--color-muted": tokens.muted,
    "--color-muted-foreground": tokens.mutedForeground,
    "--color-border": tokens.border,
    "--color-primary": tokens.primary,
    "--color-primary-foreground": tokens.primaryForeground,
    "--radius-base": tokens.radius,
    "--font-sans": tokens.fontFamily,
  };
}
