export type ColorScheme = "light" | "dark" | "system";
export type BorderRadius = "none" | "sm" | "md" | "lg" | "xl";

export interface BusinessPlatformConfig {
  identity: {
    fallbackName: string;
    fallbackLogoUrl?: string;
    businessTypeLabel?: string;
  };
  theme: {
    colorScheme: ColorScheme;
    primaryColor: string;
    secondaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    borderRadius: BorderRadius;
    fontFamily?: string;
  };
  media: {
    heroImageUrl?: string;
    galleryImageUrls?: string[];
    placeholderImageUrl?: string;
  };
  content: {
    heroTitle?: string;
    heroSubtitle?: string;
    primaryCtaLabel?: string;
    secondaryCtaLabel?: string;
    servicesTitle?: string;
    bookingTitle?: string;
    noSlotsMessage?: string;
    waitlistCtaLabel?: string;
    footerText?: string;
  };
  contact: {
    showPhone: boolean;
    showEmail: boolean;
    showAddress: boolean;
    showWebsite: boolean;
    showSocialLinks: boolean;
  };
  settings: {
    locale: string;
    currency: string;
    timeFormat: "12h" | "24h";
    dateFormat: string;
    enablePublicServiceSearch: boolean;
    enableOwnerDashboard: boolean;
  };
  booking: {
    allowGuestAvailabilityPreview: boolean;
    requireAuthBeforeSlotSelection: boolean;
    requireAuthBeforeConfirmation: boolean;
    allowWaitlist: boolean;
    allowCustomerCancellation: boolean;
    allowCustomerReschedule: boolean;
    appointmentLeadTimeMinutes?: number;
    defaultTimezone?: string;
  };
  services: {
    showPrices: boolean;
    showDuration: boolean;
    showDescription: boolean;
    defaultSort: "sortOrder" | "price" | "duration" | "name";
  };
  rules: {
    cancellationPolicyText?: string;
    reschedulePolicyText?: string;
    privacyPolicyUrl?: string;
    termsUrl?: string;
  };
  management: {
    allowOwnerBrandingEdit: boolean;
    allowOwnerBusinessProfileEdit: boolean;
    allowOwnerBookingRulesEdit: boolean;
  };
}

export interface BusinessThemeTokens {
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  primary: string;
  primaryForeground: string;
  radius: string;
  fontFamily: string;
}

export interface ResolvedBusinessConfig extends BusinessPlatformConfig {
  resolved: {
    name: string;
    logoUrl?: string;
    description?: string;
    phone?: string;
    email?: string;
    address?: string;
    website?: string;
    socialLinks?: Record<string, string>;
    timezone: string;
  };
  themeTokens: BusinessThemeTokens;
}
