"use client";

import { useParams } from "next/navigation";
import { ServiceDetail } from "@/features/catalog/components/service-detail";

export default function Page() {
  const params = useParams<{ serviceId: string }>();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <ServiceDetail serviceId={params.serviceId} />
    </main>
  );
}
