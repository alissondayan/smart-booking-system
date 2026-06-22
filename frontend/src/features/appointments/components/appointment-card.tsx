import Link from "next/link";
import type { AppointmentViewModel } from "../services/appointments.service";
import { formatDateTime } from "@/shared/lib/date-time";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { StatusBadge } from "@/shared/ui/status-badge";

interface AppointmentCardProps {
  appointment: AppointmentViewModel;
  timeZone: string;
}

export function AppointmentCard({ appointment, timeZone }: AppointmentCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <CardTitle>{appointment.serviceName}</CardTitle>
          <StatusBadge label={appointment.status} tone={appointment.status === "CANCELLED" ? "danger" : "success"} />
        </div>
      </CardHeader>
      <CardContent className="grid gap-3">
        <p>{formatDateTime(appointment.startAt, timeZone)}</p>
        <Link className="text-sm font-medium text-[var(--color-primary)]" href={`/account/appointments/${appointment.id}`}>
          View details
        </Link>
      </CardContent>
    </Card>
  );
}
