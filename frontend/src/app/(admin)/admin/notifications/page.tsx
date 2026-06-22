import { EmptyState } from "@/shared/ui/empty-state";

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <EmptyState title="Owner notifications placeholder" description="Notifications center is a future feature." />
    </main>
  );
}
