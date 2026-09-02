"use client";
import Link from "next/link";
import { useState } from "react";
import { useAdminCustomers } from "../hooks/use-admin-customers";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { Input } from "@/shared/ui/input";
const PAGE_SIZE = 20;
export function AdminCustomersPanel() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const customers = useAdminCustomers({ search, page, limit: PAGE_SIZE });
  const limit = customers.data?.limit ?? PAGE_SIZE;
  const totalPages = Math.max(
    1,
    Math.ceil((customers.data?.total ?? 0) / limit),
  );
  return (
    <div className="grid gap-4">
      <Input
        placeholder="Search customers"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />
      {customers.isPending ? (
        <EmptyState
          title="Loading customers"
          description="Fetching customer list."
        />
      ) : customers.isError ? (
        <ErrorState description={customers.error.message} />
      ) : (
        <>
          <div
            aria-busy={customers.isPlaceholderData}
            className={cn(
              "grid gap-4",
              customers.isPlaceholderData && "opacity-60",
            )}
          >
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
                    {c.phone ? <p>{c.phone}</p> : null}
                    <p className="text-sm text-[var(--color-muted-foreground)]">
                      Appointments: {c.appointmentCount}
                    </p>
                    <p className="text-sm text-[var(--color-muted-foreground)]">
                      Last appointment:{" "}
                      {c.lastAppointmentAt
                        ? new Date(c.lastAppointmentAt).toLocaleString()
                        : "None"}
                    </p>
                    <p className="text-sm text-[var(--color-muted-foreground)]">
                      Next appointment:{" "}
                      {c.nextAppointmentAt
                        ? new Date(c.nextAppointmentAt).toLocaleString()
                        : "None"}
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
          <div className="flex items-center justify-between gap-4">
            <Button
              disabled={page <= 1 || customers.isPlaceholderData}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Page {page} of {totalPages}
            </p>
            <Button
              disabled={page >= totalPages || customers.isPlaceholderData}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
