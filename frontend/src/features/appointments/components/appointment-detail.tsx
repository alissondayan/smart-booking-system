"use client";

import Link from "next/link";
import { useState } from "react";
import {
  useCancelMyAppointment,
  useMyAppointment,
  useRescheduleMyAppointment,
} from "../hooks/use-appointments";
import { isAppointmentReschedulable, toAppointmentViewModel } from "../services/appointments.service";
import { useAvailability } from "@/features/availability/hooks/use-availability";
import { getDefaultBookingDate } from "@/features/availability/services/availability.service";
import { useServices } from "@/features/catalog/hooks/use-services";
import { useBusinessConfig } from "@/shared/providers/business-provider";
import { formatDateTime, toDateInputValue } from "@/shared/lib/date-time";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { Input } from "@/shared/ui/input";
import { StatusBadge } from "@/shared/ui/status-badge";

export function AppointmentDetail({ appointmentId }: { appointmentId: string }) {
  const business = useBusinessConfig();
  const appointmentQuery = useMyAppointment(appointmentId);
  const servicesQuery = useServices();
  const cancelAppointment = useCancelMyAppointment();
  const rescheduleAppointment = useRescheduleMyAppointment();
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const availabilityQuery = useAvailability(
    appointmentQuery.data?.serviceId ?? "",
    isRescheduleOpen ? rescheduleDate : "",
  );

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
  const canReschedule = isAppointmentReschedulable(appointment) && business.booking.allowCustomerReschedule;

  const openReschedule = () => {
    setRescheduleDate(toDateInputValue(new Date(appointment.startAt)));
    setSelectedSlot(null);
    rescheduleAppointment.reset();
    setIsRescheduleOpen(true);
  };

  const closeReschedule = () => {
    setIsRescheduleOpen(false);
    setSelectedSlot(null);
    rescheduleAppointment.reset();
  };

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
          {canReschedule && !isRescheduleOpen ? <Button onClick={openReschedule}>Reschedule</Button> : null}
          <Link className="rounded-[var(--radius-base)] border border-[var(--color-border)] px-4 py-2 text-sm" href="/account/appointments">
            Back to appointments
          </Link>
        </div>

        {canReschedule && isRescheduleOpen ? (
          <section className="grid gap-4 rounded-[var(--radius-base)] border border-[var(--color-border)] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h3 className="font-semibold text-[var(--color-foreground)]">Pick a new time</h3>
              <button className="text-sm text-[var(--color-muted-foreground)] underline" onClick={closeReschedule} type="button">
                Close
              </button>
            </div>

            {business.rules.reschedulePolicyText ? (
              <p className="text-sm text-[var(--color-muted-foreground)]">{business.rules.reschedulePolicyText}</p>
            ) : null}

            <p className="text-sm text-[var(--color-muted-foreground)]">
              Current time: {formatDateTime(appointment.startAt, business.resolved.timezone)}
            </p>

            <label className="grid gap-2 text-sm font-medium">
              New date
              <Input
                min={getDefaultBookingDate()}
                onChange={(event) => {
                  setRescheduleDate(event.target.value);
                  setSelectedSlot(null);
                }}
                type="date"
                value={rescheduleDate}
              />
            </label>

            {!rescheduleDate ? (
              <p className="text-sm text-[var(--color-muted-foreground)]">Choose a date to see available times.</p>
            ) : (
              <>
                {availabilityQuery.isLoading ? <p>Loading available times...</p> : null}
                {availabilityQuery.isError ? <ErrorState description={availabilityQuery.error.message} /> : null}
                {availabilityQuery.isSuccess && !availabilityQuery.data.length ? (
                  <EmptyState title="No times available" description="There are no open slots on this date. Try another date." />
                ) : null}
                {availabilityQuery.isSuccess && availabilityQuery.data.length ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {availabilityQuery.data.map((slot) => (
                      <button
                        className={`rounded-[var(--radius-base)] border px-4 py-3 text-left text-sm ${
                          selectedSlot === slot.startAt ? "border-[var(--color-primary)] bg-[var(--color-muted)]" : "border-[var(--color-border)]"
                        }`}
                        key={slot.startAt}
                        onClick={() => setSelectedSlot(slot.startAt)}
                        type="button"
                      >
                        {formatDateTime(slot.startAt, business.resolved.timezone)}
                      </button>
                    ))}
                  </div>
                ) : null}
              </>
            )}

            {rescheduleAppointment.error ? <p className="text-sm text-red-700">{rescheduleAppointment.error.message}</p> : null}

            <div>
              <Button
                disabled={!selectedSlot || rescheduleAppointment.isPending}
                onClick={() => {
                  if (!selectedSlot) return;
                  rescheduleAppointment.mutate(
                    { appointmentId: appointment.id, newStartAt: selectedSlot },
                    { onSuccess: closeReschedule },
                  );
                }}
              >
                {rescheduleAppointment.isPending ? "Rescheduling..." : "Confirm new time"}
              </Button>
            </div>
          </section>
        ) : null}
      </CardContent>
    </Card>
  );
}
