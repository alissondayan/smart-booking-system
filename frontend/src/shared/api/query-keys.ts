export const queryKeys = {
  auth: {
    me: () => ["auth", "me"] as const,
  },
  business: {
    profile: () => ["business", "profile"] as const,
  },
  services: {
    all: () => ["services"] as const,
    detail: (id: string) => ["services", id] as const,
  },
  availability: {
    slots: (serviceId: string, date: string) =>
      ["availability", serviceId, date] as const,
  },
  appointments: {
    mine: () => ["appointments", "mine"] as const,
    admin: (filters?: unknown) =>
      ["appointments", "admin", filters ?? {}] as const,
    adminDetail: (id: string) => ["appointments", "admin", id] as const,
  },
  waitlist: {
    mine: () => ["waitlist", "mine"] as const,
    admin: (filters?: unknown) => ["waitlist", "admin", filters ?? {}] as const,
  },
  adminServices: {
    all: () => ["admin", "services"] as const,
  },
  adminAvailability: {
    rules: () => ["admin", "availability", "rules"] as const,
    dates: () => ["admin", "availability", "dates"] as const,
    blockedTimes: () => ["admin", "availability", "blocked-times"] as const,
    holidays: () => ["admin", "availability", "holidays"] as const,
  },
  customers: {
    admin: (filters?: unknown) =>
      ["admin", "customers", filters ?? {}] as const,
    detail: (id: string) => ["admin", "customers", id] as const,
  },
  integrations: {
    calendar: () => ["admin", "integrations", "calendar"] as const,
  },
};
