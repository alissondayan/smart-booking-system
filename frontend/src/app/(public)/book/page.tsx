import Link from "next/link";
import { ServicesCatalog } from "@/features/catalog/components/services-catalog";

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8">
        <p className="text-sm font-medium text-[var(--color-primary)]">Book appointment</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Start by selecting a service</h1>
        <p className="mt-3 max-w-2xl text-[var(--color-muted-foreground)]">
          Services and prices are loaded from the backend. Availability appears after selecting a service.
        </p>
        <Link className="mt-4 inline-block text-sm font-medium text-[var(--color-primary)]" href="/services">
          View all services
        </Link>
      </div>
      <ServicesCatalog />
    </main>
  );
}
