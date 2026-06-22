"use client";

import { useParams } from "next/navigation";
import { BookingPanel } from "@/features/booking/components/booking-panel";

export default function Page() {
  const params = useParams<{ serviceId: string }>();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8">
        <p className="text-sm font-medium text-[var(--color-primary)]">Available appointments</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Choose a time</h1>
      </div>
      <BookingPanel serviceId={params.serviceId} />
    </main>
  );
}
