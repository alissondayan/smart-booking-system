"use client";
import Link from "next/link";
import { useState } from "react";
import { useAdminCustomers } from "../hooks/use-admin-customers";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { Input } from "@/shared/ui/input";
export function AdminCustomersPanel() {
  const [search, setSearch] = useState("");
  const customers = useAdminCustomers({ search, limit: 20 });
  if (customers.isPending)
    return (
      <EmptyState
        title="Loading customers"
        description="Fetching customer list."
      />
    );
  if (customers.isError)
    return <ErrorState description={customers.error.message} />;
  return (
    <div className="grid gap-4">
      <Input
        placeholder="Search customers"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {customers.data.items.length ? (
        customers.data.items.map((c) => (
          <Card key={c.id}>
            <CardHeader>
              <CardTitle>
                {c.firstName} {c.lastName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{c.email}</p>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Appointments: {c.appointmentCount}
              </p>
              <Link
                className="text-sm text-[var(--color-primary)]"
                href={`/admin/customers/${c.id}`}
              >
                View customer
              </Link>
            </CardContent>
          </Card>
        ))
      ) : (
        <EmptyState
          title="No customers"
          description="No customers match the current search."
        />
      )}
    </div>
  );
}
