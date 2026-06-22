"use client";

import Link from "next/link";
import { useService } from "../hooks/use-services";
import { formatDuration, formatPrice } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";

export function ServiceDetail({ serviceId }: { serviceId: string }) {
  const serviceQuery = useService(serviceId);

  if (serviceQuery.isPending) {
    return <EmptyState title="Loading service" description="Fetching service details from the backend." />;
  }

  if (serviceQuery.isError) {
    return <ErrorState description={serviceQuery.error.message} />;
  }

  const service = serviceQuery.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{service.name}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        {service.description ? <p>{service.description}</p> : null}
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Duration</dt>
            <dd className="font-medium text-[var(--color-foreground)]">{formatDuration(service.durationMinutes)}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Price</dt>
            <dd className="font-medium text-[var(--color-foreground)]">{formatPrice(service.price)}</dd>
          </div>
        </dl>
        <div className="flex flex-wrap gap-3">
          <Link href={`/book/service/${service.id}`}>
            <Button>Find available appointments</Button>
          </Link>
          <Link className="rounded-[var(--radius-base)] border border-[var(--color-border)] px-4 py-2 text-sm" href="/services">
            Back to services
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
