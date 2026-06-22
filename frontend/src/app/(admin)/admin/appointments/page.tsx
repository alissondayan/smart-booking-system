import { EmptyState } from "@/shared/ui/empty-state";

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <EmptyState title="Owner appointments shell" description="Appointment management is deferred to Phase 3." />
    </main>
  );
}
