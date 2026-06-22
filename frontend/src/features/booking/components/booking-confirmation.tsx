"use client";

import Link from "next/link";
import { useMyAppointment } from "@/features/appointments/hooks/use-appointments";
import { useServices } from "@/features/catalog/hooks/use-services";
import { toAppointmentViewModel } from "@/features/appointments/services/appointments.service";
import { useBusinessConfig } from "@/shared/providers/business-provider";
import { formatDateTime } from "@/shared/lib/date-time";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { StatusBadge } from "@/shared/ui/status-badge";

export function BookingConfirmation({ appointmentId }: { appointmentId: string }) {
  const business = useBusinessConfig();
  const appointmentQuery = useMyAppointment(appointmentId);
  const servicesQuery = useServices();

  if (appointmentQuery.isPending || servicesQuery.isPending) {
    return <EmptyState title="Loading confirmation" description="Fetching appointment details from the backend." />;
  }

  if (appointmentQuery.isError) {
    return <ErrorState description={appointmentQuery.error.message} />;
  }

  if (servicesQuery.isError) {
    return <ErrorState description={servicesQuery.error.message} />;
  }

  const appointment = toAppointmentViewModel(appointmentQuery.data, servicesQuery.data);

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Booking confirmed</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5">
        <StatusBadge label={appointment.status} tone="success" />
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Service</dt>
            <dd className="font-medium text-[var(--color-foreground)]">{appointment.serviceName}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Starts</dt>
            <dd className="font-medium text-[var(--color-foreground)]">{formatDateTime(appointment.startAt, business.resolved.timezone)}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Ends</dt>
            <dd className="font-medium text-[var(--color-foreground)]">{formatDateTime(appointment.endAt, business.resolved.timezone)}</dd>
          </div>
        </dl>
        <div className="flex flex-wrap gap-3">
          <Link href="/account/appointments">
            <Button>View my appointments</Button>
          </Link>
          <Link className="rounded-[var(--radius-base)] border border-[var(--color-border)] px-4 py-2 text-sm" href="/services">
            Book another appointment
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
