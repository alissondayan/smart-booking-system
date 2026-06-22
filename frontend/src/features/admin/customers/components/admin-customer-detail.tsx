"use client";
import { useAdminCustomer } from "../hooks/use-admin-customers";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { StatusBadge } from "@/shared/ui/status-badge";
export function AdminCustomerDetail({ customerId }: { customerId: string }) {
  const customer = useAdminCustomer(customerId);
  if (customer.isPending)
    return (
      <EmptyState
        title="Loading customer"
        description="Fetching customer details."
      />
    );
  if (customer.isError)
    return <ErrorState description={customer.error.message} />;
  const c = customer.data;
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>
            {c.firstName} {c.lastName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{c.email}</p>
          {c.phone ? <p>{c.phone}</p> : null}
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Total appointments: {c.appointmentCount}
          </p>
        </CardContent>
      </Card>
      {c.appointments.map((a) => (
        <Card key={a.id}>
          <CardHeader>
            <div className="flex justify-between gap-3">
              <CardTitle>{a.serviceName}</CardTitle>
              <StatusBadge label={a.status} />
            </div>
          </CardHeader>
          <CardContent>
            <p>{new Date(a.startAt).toLocaleString()}</p>
            {a.notes ? <p>{a.notes}</p> : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
