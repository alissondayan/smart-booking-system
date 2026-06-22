"use client";

import Link from "next/link";
import { useState } from "react";
import {
  useAdminAppointments,
  useCancelAdminAppointment,
} from "../hooks/use-admin-appointments";
import { useAdminServices } from "@/features/admin/services/hooks/use-admin-services";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { Input } from "@/shared/ui/input";
import { StatusBadge } from "@/shared/ui/status-badge";

export function AdminAppointmentsPanel() {
  const [date, setDate] = useState("");
  const appointments = useAdminAppointments(date ? { date } : {});
  const services = useAdminServices();
  const cancel = useCancelAdminAppointment();
  if (appointments.isPending || services.isPending)
    return (
      <EmptyState
        title="Loading appointments"
        description="Fetching owner appointment calendar."
      />
    );
  if (appointments.isError)
    return <ErrorState description={appointments.error.message} />;
  if (services.isError)
    return <ErrorState description={services.error.message} />;
  return (
    <div className="grid gap-4">
      <Card>
        <CardContent className="pt-5">
          <label className="grid max-w-xs gap-1 text-sm font-medium">
            Filter by date
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
        </CardContent>
      </Card>
      {appointments.data.length ? (
        appointments.data.map((a) => {
          const service = services.data.find((s) => s.id === a.serviceId);
          return (
            <Card key={a.id}>
              <CardHeader>
                <div className="flex flex-wrap justify-between gap-3">
                  <CardTitle>{service?.name ?? "Appointment"}</CardTitle>
                  <StatusBadge
                    label={a.status}
                    tone={a.status === "CANCELLED" ? "danger" : "success"}
                  />
                </div>
              </CardHeader>
              <CardContent className="grid gap-3">
                <p>
                  {new Date(a.startAt).toLocaleString()} -{" "}
                  {new Date(a.endAt).toLocaleString()}
                </p>
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  Customer: {a.customerId}
                </p>
                <div className="flex gap-2">
                  <Link
                    className="rounded-[var(--radius-base)] border border-[var(--color-border)] px-4 py-2 text-sm"
                    href={`/admin/appointments/${a.id}`}
                  >
                    Details
                  </Link>
                  {a.status === "CONFIRMED" ? (
                    <Button
                      disabled={cancel.isPending}
                      onClick={() => cancel.mutate(a.id)}
                    >
                      Cancel
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          );
        })
      ) : (
        <EmptyState
          title="No appointments"
          description="No appointments match the current filters."
        />
      )}
    </div>
  );
}
