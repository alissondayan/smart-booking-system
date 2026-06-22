import type { BusinessPlatformConfig } from "./business-config.schema";

export const defaultBusinessConfig: BusinessPlatformConfig = {
  identity: {
    fallbackName: "Smart Booking",
    businessTypeLabel: "Service business",
  },
  theme: {
    colorScheme: "light",
    primaryColor: "#2563eb",
    backgroundColor: "#ffffff",
    textColor: "#111827",
    borderRadius: "lg",
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  media: {},
  content: {
    heroTitle: "Book appointments with confidence",
    heroSubtitle: "A flexible booking experience for service-based businesses.",
    primaryCtaLabel: "Book an appointment",
    secondaryCtaLabel: "View services",
    servicesTitle: "Services",
    bookingTitle: "Book appointment",
    noSlotsMessage: "No available times for this selection.",
    waitlistCtaLabel: "Join waitlist",
    footerText: "Powered by Smart Booking System",
  },
  contact: {
    showPhone: true,
    showEmail: true,
    showAddress: true,
    showWebsite: true,
    showSocialLinks: true,
  },
  settings: {
    locale: "en-US",
    currency: "USD",
    timeFormat: "24h",
    dateFormat: "yyyy-MM-dd",
    enablePublicServiceSearch: true,
    enableOwnerDashboard: true,
  },
  booking: {
    allowGuestAvailabilityPreview: true,
    requireAuthBeforeSlotSelection: false,
    requireAuthBeforeConfirmation: true,
    allowWaitlist: true,
    allowCustomerCancellation: true,
    allowCustomerReschedule: true,
    defaultTimezone: "UTC",
  },
  services: {
    showPrices: true,
    showDuration: true,
    showDescription: true,
    defaultSort: "sortOrder",
  },
  rules: {},
  management: {
    allowOwnerBrandingEdit: false,
    allowOwnerBusinessProfileEdit: true,
    allowOwnerBookingRulesEdit: false,
  },
};
