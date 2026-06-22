import Link from "next/link";
import type { Service } from "@/shared/types/api";
import { formatDuration, formatPrice } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>{service.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        {service.description ? <p>{service.description}</p> : <p>Service details are available during booking.</p>}
        <dl className="grid gap-1 text-sm">
          <div className="flex justify-between gap-4">
            <dt>Duration</dt>
            <dd className="font-medium text-[var(--color-foreground)]">{formatDuration(service.durationMinutes)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Price</dt>
            <dd className="font-medium text-[var(--color-foreground)]">{formatPrice(service.price)}</dd>
          </div>
        </dl>
        <div className="mt-auto flex flex-wrap gap-3">
          <Link className="rounded-[var(--radius-base)] border border-[var(--color-border)] px-4 py-2 text-sm" href={`/services/${service.id}`}>
            Details
          </Link>
          <Link href={`/book/service/${service.id}`}>
            <Button>Book</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
