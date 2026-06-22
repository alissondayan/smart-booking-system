import type { UserRole } from "@/shared/types/api";

export type PermissionKey =
  | "appointment:read"
  | "appointment:manage"
  | "availability:manage"
  | "service:manage"
  | "customer:read"
  | "waitlist:read"
  | "business:manage"
  | "integration:manage"
  | "analytics:read"
  | "payment:manage"
  | "staff:manage";

export interface RoutePermission {
  requiresAuth: boolean;
  allowedRoles?: UserRole[];
  requiredPermissions?: PermissionKey[];
  redirectUnauthenticatedTo: string;
  redirectUnauthorizedTo: string;
}

export const publicPermission: RoutePermission = {
  requiresAuth: false,
  redirectUnauthenticatedTo: "/auth/login",
  redirectUnauthorizedTo: "/forbidden",
};

export const customerPermission: RoutePermission = {
  requiresAuth: true,
  allowedRoles: ["CUSTOMER"],
  redirectUnauthenticatedTo: "/auth/login",
  redirectUnauthorizedTo: "/forbidden",
};

export const ownerPermission: RoutePermission = {
  requiresAuth: true,
  allowedRoles: ["OWNER"],
  redirectUnauthenticatedTo: "/auth/login",
  redirectUnauthorizedTo: "/forbidden",
};
