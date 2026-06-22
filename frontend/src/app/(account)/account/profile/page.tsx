import { EmptyState } from "@/shared/ui/empty-state";

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <EmptyState title="Customer profile shell" description="Profile functionality is deferred beyond the foundation phase." />
    </main>
  );
}
