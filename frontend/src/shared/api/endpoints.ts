export const endpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    me: "/auth/me",
  },
  business: "/business",
  services: "/services",
  availability: "/availability",
  appointments: "/appointments",
  myAppointments: "/me/appointments",
  waitlist: "/waitlist",
  myWaitlist: "/me/waitlist",
  admin: {
    services: "/admin/services",
    appointments: "/admin/appointments",
    customers: "/admin/customers",
    waitlist: "/admin/waitlist",
  },
} as const;
