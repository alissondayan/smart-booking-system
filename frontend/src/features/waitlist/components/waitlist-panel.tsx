"use client";

import { useCancelMyWaitlistEntry, useMyWaitlist } from "../hooks/use-waitlist";
import { useServices } from "@/features/catalog/hooks/use-services";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { StatusBadge } from "@/shared/ui/status-badge";

export function WaitlistPanel() {
  const waitlistQuery = useMyWaitlist();
  const servicesQuery = useServices();
  const cancelEntry = useCancelMyWaitlistEntry();

  if (waitlistQuery.isPending || servicesQuery.isPending) {
    return <EmptyState title="Loading waitlist" description="Fetching your waitlist entries from the backend." />;
  }

  if (waitlistQuery.isError) {
    return <ErrorState description={waitlistQuery.error.message} />;
  }

  if (servicesQuery.isError) {
    return <ErrorState description={servicesQuery.error.message} />;
  }

  if (!waitlistQuery.data.length) {
    return <EmptyState title="No waitlist entries" description="Waitlist entries will appear here when you join one." />;
  }

  return (
    <div className="grid gap-4">
      {waitlistQuery.data.map((entry) => {
        const service = servicesQuery.data.find((item) => item.id === entry.serviceId);

        return (
          <Card key={entry.id}>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <CardTitle>{service?.name ?? "Service"}</CardTitle>
                <StatusBadge label={entry.status} tone={entry.status === "ACTIVE" ? "success" : "neutral"} />
              </div>
            </CardHeader>
            <CardContent className="grid gap-3">
              <p>Preferred date: {entry.preferredDate ?? "Any available date"}</p>
              {entry.status === "ACTIVE" ? (
                <Button disabled={cancelEntry.isPending} onClick={() => cancelEntry.mutate(entry.id)}>
                  {cancelEntry.isPending ? "Cancelling..." : "Cancel waitlist entry"}
                </Button>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
      {cancelEntry.error ? <p className="text-sm text-red-700">{cancelEntry.error.message}</p> : null}
    </div>
  );
}
