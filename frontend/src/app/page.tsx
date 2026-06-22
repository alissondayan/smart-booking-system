import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
      <section className="space-y-6">
        <p className="text-sm font-medium text-[var(--color-primary)]">Phase 1 foundation</p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight">Smart Booking frontend architecture foundation</h1>
        <p className="max-w-2xl text-[var(--color-muted-foreground)]">
          Generic route, theme, auth, API, state, permissions, and shared UI foundations are ready for future product phases.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button>Foundation ready</Button>
          <Link className="rounded-[var(--radius-base)] border border-[var(--color-border)] px-4 py-2 text-sm" href="/services">
            View public route shell
          </Link>
        </div>
      </section>
      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          ["Public area", "Landing, services, booking, and auth route architecture."],
          ["Customer area", "Protected account layout and role guard foundation."],
          ["Owner area", "Admin layout and owner-only route guard foundation."],
        ].map(([title, description]) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>{description}</CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
