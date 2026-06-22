import { EmptyState } from "@/shared/ui/empty-state";

export default function ForbiddenPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <EmptyState title="Access denied" description="Your account does not have permission to view this area." />
    </main>
  );
}
