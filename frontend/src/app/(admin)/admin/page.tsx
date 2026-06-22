import { EmptyState } from "@/shared/ui/empty-state";

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <EmptyState title="Owner dashboard shell" description="Owner dashboard functionality is deferred to Phase 3." />
    </main>
  );
}
