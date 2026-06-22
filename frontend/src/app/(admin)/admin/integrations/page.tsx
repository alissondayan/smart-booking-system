import { EmptyState } from "@/shared/ui/empty-state";

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <EmptyState title="Integrations shell" description="Calendar integration UI is deferred to Phase 3." />
    </main>
  );
}
