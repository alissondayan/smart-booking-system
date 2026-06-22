import { ServicesCatalog } from "@/features/catalog/components/services-catalog";

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8">
        <p className="text-sm font-medium text-[var(--color-primary)]">Services</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Choose a service</h1>
        <p className="mt-3 max-w-2xl text-[var(--color-muted-foreground)]">
          Browse active services from the backend and select one to see available appointments.
        </p>
      </div>
      <ServicesCatalog />
    </main>
  );
}
