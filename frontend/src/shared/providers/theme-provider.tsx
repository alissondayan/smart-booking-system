"use client";

import type { ReactNode } from "react";
import { getThemeStyle } from "@/features/business/branding/services/theme.service";
import { useBusinessConfig } from "./business-provider";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const businessConfig = useBusinessConfig();

  return <div style={getThemeStyle(businessConfig)}>{children}</div>;
}
