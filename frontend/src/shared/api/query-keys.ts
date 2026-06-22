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
    slots: (serviceId: string, date: string) => ["availability", serviceId, date] as const,
  },
  appointments: {
    mine: () => ["appointments", "mine"] as const,
    admin: () => ["appointments", "admin"] as const,
  },
  waitlist: {
    mine: () => ["waitlist", "mine"] as const,
    admin: () => ["waitlist", "admin"] as const,
  },
};
