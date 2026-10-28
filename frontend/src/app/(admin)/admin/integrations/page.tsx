import { Suspense } from "react";
import { AdminIntegrationsPanel } from "@/features/admin/integrations/components/admin-integrations-panel";

export default function Page() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <Suspense fallback={<p>Loading integrations...</p>}>
        <AdminIntegrationsPanel />
      </Suspense>
    </main>
  );
}
