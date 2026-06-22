import type { NavigationItem } from "@/shared/types/common";
import { routes } from "@/shared/lib/routes";

export const publicNavigation: NavigationItem[] = [
  { label: "Services", href: routes.services },
  { label: "Book", href: routes.book },
];

export const customerNavigation: NavigationItem[] = [
  { label: "Dashboard", href: routes.account },
  { label: "My appointments", href: routes.accountAppointments },
  { label: "Waitlist", href: routes.accountWaitlist },
  { label: "Profile", href: routes.accountProfile },
];

export const ownerNavigation: NavigationItem[] = [
  { label: "Dashboard", href: routes.admin },
  { label: "Services", href: "/admin/services" },
  { label: "Availability", href: "/admin/availability" },
  { label: "Appointments", href: "/admin/appointments" },
  { label: "Customers", href: "/admin/customers" },
  { label: "Waitlist", href: "/admin/waitlist" },
  { label: "Business", href: "/admin/business" },
  { label: "Integrations", href: "/admin/integrations" },
];
