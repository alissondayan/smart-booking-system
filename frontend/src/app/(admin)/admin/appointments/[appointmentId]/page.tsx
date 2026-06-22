"use client";
import { useParams } from "next/navigation";
import { AdminAppointmentDetail } from "@/features/admin/appointments/components/admin-appointment-detail";
export default function Page() {
  const params = useParams<{ appointmentId: string }>();
  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <AdminAppointmentDetail appointmentId={params.appointmentId} />
    </main>
  );
}
