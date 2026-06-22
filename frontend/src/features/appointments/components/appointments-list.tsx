"use client";

import Link from "next/link";
import { useMyAppointments } from "../hooks/use-appointments";
import { sortAppointmentsByStart, toAppointmentViewModel } from "../services/appointments.service";
import { useServices } from "@/features/catalog/hooks/use-services";
import { useBusinessConfig } from "@/shared/providers/business-provider";
import { AppointmentCard } from "./appointment-card";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";

export function AppointmentsList() {
  const business = useBusinessConfig();
  const appointmentsQuery = useMyAppointments();
  const servicesQuery = useServices();

  if (appointmentsQuery.isPending || servicesQuery.isPending) {
    return <EmptyState title="Loading appointments" description="Fetching your appointments from the backend." />;
  }

  if (appointmentsQuery.isError) {
    return <ErrorState description={appointmentsQuery.error.message} />;
  }

  if (servicesQuery.isError) {
    return <ErrorState description={servicesQuery.error.message} />;
  }

  const appointments = sortAppointmentsByStart(appointmentsQuery.data).map((appointment) =>
    toAppointmentViewModel(appointment, servicesQuery.data),
  );

  if (!appointments.length) {
    return (
      <EmptyState
        title="No appointments yet"
        description="When you book an appointment, it will appear here."
      />
    );
  }

  return (
    <div className="grid gap-4">
      {appointments.map((appointment) => (
        <AppointmentCard appointment={appointment} key={appointment.id} timeZone={business.resolved.timezone} />
      ))}
      <Link className="text-sm font-medium text-[var(--color-primary)]" href="/services">
        Book another appointment
      </Link>
    </div>
  );
}
