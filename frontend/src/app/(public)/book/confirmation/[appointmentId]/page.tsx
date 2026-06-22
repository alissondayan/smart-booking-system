"use client";

import { useParams } from "next/navigation";
import { BookingConfirmation } from "@/features/booking/components/booking-confirmation";

export default function Page() {
  const params = useParams<{ appointmentId: string }>();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <BookingConfirmation appointmentId={params.appointmentId} />
    </main>
  );
}
