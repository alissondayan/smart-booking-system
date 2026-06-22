"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAvailability } from "@/features/availability/hooks/use-availability";
import { getDefaultBookingDate } from "@/features/availability/services/availability.service";
import { useBookAppointment } from "@/features/appointments/hooks/use-appointments";
import { useService } from "@/features/catalog/hooks/use-services";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useJoinWaitlist } from "@/features/waitlist/hooks/use-waitlist";
import { useBusinessConfig } from "@/shared/providers/business-provider";
import { formatDateTime } from "@/shared/lib/date-time";
import { formatDuration, formatPrice } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { Input } from "@/shared/ui/input";

export function BookingPanel({ serviceId }: { serviceId: string }) {
  const router = useRouter();
  const auth = useAuth();
  const business = useBusinessConfig();
  const [date, setDate] = useState(getDefaultBookingDate());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const serviceQuery = useService(serviceId);
  const availabilityQuery = useAvailability(serviceId, date);
  const bookAppointment = useBookAppointment();
  const joinWaitlist = useJoinWaitlist();

  if (serviceQuery.isPending) {
    return <EmptyState title="Loading booking details" description="Fetching service details from the backend." />;
  }

  if (serviceQuery.isError) {
    return <ErrorState description={serviceQuery.error.message} />;
  }

  const service = serviceQuery.data;
  const returnTo = `/book/service/${serviceId}`;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Choose a date</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Input min={getDefaultBookingDate()} onChange={(event) => setDate(event.target.value)} type="date" value={date} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {availabilityQuery.isPending ? <p>Loading available times...</p> : null}
            {availabilityQuery.isError ? <ErrorState description={availabilityQuery.error.message} /> : null}
            {availabilityQuery.isSuccess && !availabilityQuery.data.length ? (
              <div className="grid gap-4">
                <EmptyState title="No appointments available" description="Try another date or join the waitlist for this service." />
                {auth.status === "authenticated" ? (
                  <Button disabled={joinWaitlist.isPending} onClick={() => joinWaitlist.mutate({ serviceId, preferredDate: date })}>
                    {joinWaitlist.isPending ? "Joining waitlist..." : "Join waitlist"}
                  </Button>
                ) : (
                  <Link className="text-sm font-medium text-[var(--color-primary)]" href={`/auth/login?returnTo=${encodeURIComponent(returnTo)}`}>
                    Login to join waitlist
                  </Link>
                )}
                {joinWaitlist.isSuccess ? <p className="text-sm text-green-700">You joined the waitlist for this service.</p> : null}
                {joinWaitlist.error ? <p className="text-sm text-red-700">{joinWaitlist.error.message}</p> : null}
              </div>
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
          </CardContent>
        </Card>
      </section>

      <aside>
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle>Booking summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div>
              <p className="font-medium text-[var(--color-foreground)]">{service.name}</p>
              <p>{formatDuration(service.durationMinutes)}</p>
              <p>{formatPrice(service.price)}</p>
            </div>
            <div>
              <p className="text-[var(--color-muted-foreground)]">Selected time</p>
              <p className="font-medium text-[var(--color-foreground)]">
                {selectedSlot ? formatDateTime(selectedSlot, business.resolved.timezone) : "Choose a time"}
              </p>
            </div>
            {auth.status === "unauthenticated" ? (
              <div className="grid gap-2">
                <Link href={`/auth/login?returnTo=${encodeURIComponent(returnTo)}`}>
                  <Button className="w-full">Login to book</Button>
                </Link>
                <Link className="text-center text-sm text-[var(--color-primary)]" href={`/auth/register?returnTo=${encodeURIComponent(returnTo)}`}>
                  Create an account
                </Link>
              </div>
            ) : (
              <Button
                disabled={!selectedSlot || bookAppointment.isPending}
                onClick={() => {
                  if (!selectedSlot) return;
                  bookAppointment.mutate(
                    { serviceId, startAt: selectedSlot },
                    {
                      onSuccess: (appointment) => {
                        router.push(`/book/confirmation/${appointment.id}`);
                      },
                    },
                  );
                }}
              >
                {bookAppointment.isPending ? "Booking..." : "Confirm booking"}
              </Button>
            )}
            {bookAppointment.error ? <p className="text-sm text-red-700">{bookAppointment.error.message}</p> : null}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
