"use client";
import { useState } from "react";
import type { WaitlistStatus } from "@/shared/types/api";
import { useAdminServices } from "@/features/admin/services/hooks/use-admin-services";
import { useAdminWaitlist } from "../hooks/use-admin-waitlist";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { StatusBadge } from "@/shared/ui/status-badge";
export function AdminWaitlistPanel() {
  const [status, setStatus] = useState<WaitlistStatus | "">("");
  const waitlist = useAdminWaitlist(status ? { status } : {});
  const services = useAdminServices();
  if (waitlist.isPending || services.isPending)
    return (
      <EmptyState
        title="Loading waitlist"
        description="Fetching waitlist entries."
      />
    );
  if (waitlist.isError)
    return <ErrorState description={waitlist.error.message} />;
  if (services.isError)
    return <ErrorState description={services.error.message} />;
  return (
    <div className="grid gap-4">
      <select
        className="max-w-xs rounded-[var(--radius-base)] border border-[var(--color-border)] p-2"
        value={status}
        onChange={(e) => setStatus(e.target.value as WaitlistStatus | "")}
      >
        <option value="">All statuses</option>
        <option value="ACTIVE">Active</option>
        <option value="NOTIFIED">Notified</option>
        <option value="FULFILLED">Fulfilled</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
      {waitlist.data.length ? (
        waitlist.data.map((w) => {
          const service = services.data.find((s) => s.id === w.serviceId);
          return (
            <Card key={w.id}>
              <CardHeader>
                <div className="flex justify-between gap-3">
                  <CardTitle>{service?.name ?? "Service"}</CardTitle>
                  <StatusBadge label={w.status} />
                </div>
              </CardHeader>
              <CardContent>
                <p>Customer: {w.customerId}</p>
                <p>Preferred date: {w.preferredDate ?? "Any"}</p>
              </CardContent>
            </Card>
          );
        })
      ) : (
        <EmptyState
          title="No waitlist entries"
          description="No entries match the current filters."
        />
      )}
    </div>
  );
}
