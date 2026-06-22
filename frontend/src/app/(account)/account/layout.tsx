import type { ReactNode } from "react";
import Link from "next/link";
import { customerNavigation } from "@/config/navigation";
import { customerPermission } from "@/config/permissions";
import { ProtectedRoute } from "@/shared/providers/protected-route";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute permission={customerPermission}>
      <div className="min-h-screen bg-[var(--color-background)]">
        <header className="border-b border-[var(--color-border)] px-6 py-4">
          <nav className="mx-auto flex max-w-6xl flex-wrap gap-4 text-sm">
            {customerNavigation.map((item) => (
              <Link key={item.href} href={item.href}>{item.label}</Link>
            ))}
          </nav>
        </header>
        {children}
      </div>
    </ProtectedRoute>
  );
}
