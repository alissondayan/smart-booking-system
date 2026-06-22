import { WaitlistPanel } from "@/features/waitlist/components/waitlist-panel";

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8">
        <p className="text-sm font-medium text-[var(--color-primary)]">My waitlist</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Waitlist entries</h1>
      </div>
      <WaitlistPanel />
    </main>
  );
}
