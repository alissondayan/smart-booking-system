"use client";

import { ErrorState } from "@/shared/ui/error-state";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <ErrorState description="The application route failed to render." />
      <button className="mt-4 text-sm text-[var(--color-primary)]" onClick={reset} type="button">
        Try again
      </button>
    </main>
  );
}
