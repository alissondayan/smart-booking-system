"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import type { RoutePermission } from "@/config/permissions";
import { useAuth } from "./auth-provider";
import { canAccessRoute } from "@/shared/lib/permissions";

export function ProtectedRoute({ children, permission }: { children: ReactNode; permission: RoutePermission }) {
  const { user, status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading" || canAccessRoute(user, permission)) {
      return;
    }

    if (!user) {
      router.replace(`${permission.redirectUnauthenticatedTo}?returnTo=${encodeURIComponent(pathname)}`);
      return;
    }

    router.replace(permission.redirectUnauthorizedTo);
  }, [pathname, permission, router, status, user]);

  if (!canAccessRoute(user, permission)) {
    return <main className="mx-auto max-w-5xl px-6 py-12 text-sm text-[var(--color-muted-foreground)]">Checking access...</main>;
  }

  return <>{children}</>;
}
