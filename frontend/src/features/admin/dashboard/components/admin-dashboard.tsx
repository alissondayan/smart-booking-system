"use client";

import Link from "next/link";
import { useAdminAppointments } from "@/features/admin/appointments/hooks/use-admin-appointments";
import { useAdminServices } from "@/features/admin/services/hooks/use-admin-services";
import { useAdminWaitlist } from "@/features/admin/waitlist/hooks/use-admin-waitlist";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { ErrorState } from "@/shared/ui/error-state";

export function AdminDashboard() {
  const services = useAdminServices();
  const appointments = useAdminAppointments();
  const waitlist = useAdminWaitlist({ status: "ACTIVE" });

  if (services.isError)
    return <ErrorState description={services.error.message} />;
  if (appointments.isError)
    return <ErrorState description={appointments.error.message} />;
  if (waitlist.isError)
    return <ErrorState description={waitlist.error.message} />;

  const upcoming =
    appointments.data?.filter(
      (item) =>
        item.status === "CONFIRMED" && new Date(item.startAt) >= new Date(),
    ).length ?? 0;
  const activeServices =
    services.data?.filter((item) => item.isActive).length ?? 0;
  const activeWaitlist = waitlist.data?.length ?? 0;

  return (
    <div className="grid gap-6">
      <section>
        <p className="text-sm font-medium text-[var(--color-primary)]">
          Owner dashboard
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Business overview
        </h1>
        <p className="mt-3 text-[var(--color-muted-foreground)]">
          Manage services, availability, appointments, customers, and
          operational settings.
        </p>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        <Metric
          title="Upcoming appointments"
          value={appointments.isPending ? "..." : upcoming}
        />
        <Metric
          title="Active services"
          value={services.isPending ? "..." : activeServices}
        />
        <Metric
          title="Active waitlist"
          value={waitlist.isPending ? "..." : activeWaitlist}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Quick actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {[
            ["Services", "/admin/services"],
            ["Availability", "/admin/availability"],
            ["Appointments", "/admin/appointments"],
            ["Customers", "/admin/customers"],
            ["Business", "/admin/business"],
          ].map(([label, href]) => (
            <Link
              className="rounded-[var(--radius-base)] border border-[var(--color-border)] px-4 py-2 text-sm"
              href={href}
              key={href}
            >
              {label}
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
function Metric({ title, value }: { title: string; value: string | number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold text-[var(--color-foreground)]">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
