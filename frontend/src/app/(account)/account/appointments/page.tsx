import { AppointmentsList } from "@/features/appointments/components/appointments-list";

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8">
        <p className="text-sm font-medium text-[var(--color-primary)]">My appointments</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Your bookings</h1>
      </div>
      <AppointmentsList />
    </main>
  );
}
