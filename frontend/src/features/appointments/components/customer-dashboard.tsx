"use client";

import Link from "next/link";
import { useMyAppointments } from "../hooks/use-appointments";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { ErrorState } from "@/shared/ui/error-state";

export function CustomerDashboard() {
  const appointmentsQuery = useMyAppointments();

  if (appointmentsQuery.isError) {
    return <ErrorState description={appointmentsQuery.error.message} />;
  }

  const appointments = appointmentsQuery.data ?? [];
  const upcomingCount = appointments.filter((appointment) => appointment.status === "CONFIRMED" && new Date(appointment.startAt) >= new Date()).length;

  return (
    <div className="grid gap-6">
      <section>
        <p className="text-sm font-medium text-[var(--color-primary)]">Customer dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Manage your bookings</h1>
        <p className="mt-3 max-w-2xl text-[var(--color-muted-foreground)]">
          Review upcoming appointments and start a new booking from one place.
        </p>
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[var(--color-foreground)]">{appointmentsQuery.isPending ? "..." : upcomingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link href="/services">
              <Button>Book appointment</Button>
            </Link>
            <Link className="rounded-[var(--radius-base)] border border-[var(--color-border)] px-4 py-2 text-sm" href="/account/appointments">
              View appointments
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
