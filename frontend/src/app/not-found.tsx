import Link from "next/link";
import { EmptyState } from "@/shared/ui/empty-state";

export default function NotFoundPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <EmptyState title="Page not found" description="The requested route does not exist." />
      <Link className="mt-4 inline-block text-sm text-[var(--color-primary)]" href="/">
        Go home
      </Link>
    </main>
  );
}
