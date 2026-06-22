"use client";

import Link from "next/link";
import { useCancelMyAppointment, useMyAppointment } from "../hooks/use-appointments";
import { toAppointmentViewModel } from "../services/appointments.service";
import { useServices } from "@/features/catalog/hooks/use-services";
import { useBusinessConfig } from "@/shared/providers/business-provider";
import { formatDateTime } from "@/shared/lib/date-time";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { StatusBadge } from "@/shared/ui/status-badge";

export function AppointmentDetail({ appointmentId }: { appointmentId: string }) {
  const business = useBusinessConfig();
  const appointmentQuery = useMyAppointment(appointmentId);
  const servicesQuery = useServices();
  const cancelAppointment = useCancelMyAppointment();

  if (appointmentQuery.isPending || servicesQuery.isPending) {
    return <EmptyState title="Loading appointment" description="Fetching appointment details from the backend." />;
  }

  if (appointmentQuery.isError) {
    return <ErrorState description={appointmentQuery.error.message} />;
  }

  if (servicesQuery.isError) {
    return <ErrorState description={servicesQuery.error.message} />;
  }

  const appointment = toAppointmentViewModel(appointmentQuery.data, servicesQuery.data);
  const canCancel = appointment.status === "CONFIRMED";

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <CardTitle>{appointment.serviceName}</CardTitle>
          <StatusBadge label={appointment.status} tone={appointment.status === "CANCELLED" ? "danger" : "success"} />
        </div>
      </CardHeader>
      <CardContent className="grid gap-5">
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Starts</dt>
            <dd className="font-medium text-[var(--color-foreground)]">{formatDateTime(appointment.startAt, business.resolved.timezone)}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Ends</dt>
            <dd className="font-medium text-[var(--color-foreground)]">{formatDateTime(appointment.endAt, business.resolved.timezone)}</dd>
          </div>
          {appointment.notes ? (
            <div className="sm:col-span-2">
              <dt className="text-[var(--color-muted-foreground)]">Notes</dt>
              <dd className="font-medium text-[var(--color-foreground)]">{appointment.notes}</dd>
            </div>
          ) : null}
        </dl>
        {cancelAppointment.error ? <p className="text-sm text-red-700">{cancelAppointment.error.message}</p> : null}
        <div className="flex flex-wrap gap-3">
          {canCancel ? (
            <Button disabled={cancelAppointment.isPending} onClick={() => cancelAppointment.mutate(appointment.id)}>
              {cancelAppointment.isPending ? "Cancelling..." : "Cancel appointment"}
            </Button>
          ) : null}
          <Link className="rounded-[var(--radius-base)] border border-[var(--color-border)] px-4 py-2 text-sm" href="/account/appointments">
            Back to appointments
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
