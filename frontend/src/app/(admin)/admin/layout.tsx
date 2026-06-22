import type { ReactNode } from "react";
import Link from "next/link";
import { ownerNavigation } from "@/config/navigation";
import { ownerPermission } from "@/config/permissions";
import { ProtectedRoute } from "@/shared/providers/protected-route";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute permission={ownerPermission}>
      <div className="min-h-screen bg-[var(--color-muted)] md:grid md:grid-cols-[240px_1fr]">
        <aside className="border-r border-[var(--color-border)] bg-[var(--color-background)] px-6 py-6">
          <Link className="font-semibold" href="/admin">Owner Area</Link>
          <nav className="mt-6 grid gap-3 text-sm text-[var(--color-muted-foreground)]">
            {ownerNavigation.map((item) => (
              <Link key={item.href} href={item.href}>{item.label}</Link>
            ))}
          </nav>
        </aside>
        <section>{children}</section>
      </div>
    </ProtectedRoute>
  );
}
