import type { RoutePermission } from "@/config/permissions";
import type { AuthUser } from "@/shared/types/api";

export function canAccessRoute(user: AuthUser | null, permission: RoutePermission): boolean {
  if (!permission.requiresAuth) {
    return true;
  }

  if (!user) {
    return false;
  }

  if (permission.allowedRoles?.length) {
    return permission.allowedRoles.includes(user.role);
  }

  return true;
}
