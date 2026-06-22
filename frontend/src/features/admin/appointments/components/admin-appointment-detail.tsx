"use client";

import { useState } from "react";
import {
  useAdminAppointment,
  useUpdateAdminAppointmentNotes,
} from "../hooks/use-admin-appointments";
import { useAdminServices } from "@/features/admin/services/hooks/use-admin-services";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { Input } from "@/shared/ui/input";
import { StatusBadge } from "@/shared/ui/status-badge";

export function AdminAppointmentDetail({
  appointmentId,
}: {
  appointmentId: string;
}) {
  const appointment = useAdminAppointment(appointmentId);
  const services = useAdminServices();
  const updateNotes = useUpdateAdminAppointmentNotes();
  const [notes, setNotes] = useState("");
  if (appointment.isPending || services.isPending)
    return (
      <EmptyState
        title="Loading appointment"
        description="Fetching appointment details."
      />
    );
  if (appointment.isError)
    return <ErrorState description={appointment.error.message} />;
  if (services.isError)
    return <ErrorState description={services.error.message} />;
  const service = services.data.find(
    (s) => s.id === appointment.data.serviceId,
  );
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap justify-between gap-3">
          <CardTitle>{service?.name ?? "Appointment"}</CardTitle>
          <StatusBadge label={appointment.data.status} />
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <p>Starts: {new Date(appointment.data.startAt).toLocaleString()}</p>
        <p>Ends: {new Date(appointment.data.endAt).toLocaleString()}</p>
        <p>Customer: {appointment.data.customerId}</p>
        <label className="grid gap-2 text-sm font-medium">
          Owner notes
          <Input
            value={notes || appointment.data.notes || ""}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>
        <Button
          disabled={updateNotes.isPending}
          onClick={() => updateNotes.mutate({ id: appointment.data.id, notes })}
        >
          Save notes
        </Button>
        {updateNotes.error ? (
          <p className="text-sm text-red-700">{updateNotes.error.message}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
