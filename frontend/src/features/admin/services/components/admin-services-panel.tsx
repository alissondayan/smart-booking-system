"use client";

import { useState } from "react";
import type { Service } from "@/shared/types/api";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { Input } from "@/shared/ui/input";
import { StatusBadge } from "@/shared/ui/status-badge";
import { formatDuration, formatPrice } from "@/shared/lib/format";
import {
  useAdminServices,
  useCreateAdminService,
  useDeactivateAdminService,
  useUpdateAdminService,
} from "../hooks/use-admin-services";
import type { ServicePayload } from "../api/admin-services.api";

const emptyForm: ServicePayload = {
  name: "",
  description: "",
  durationMinutes: 60,
  price: 0,
  isActive: true,
  sortOrder: 0,
};

export function AdminServicesPanel() {
  const services = useAdminServices();
  const createService = useCreateAdminService();
  const updateService = useUpdateAdminService();
  const deactivateService = useDeactivateAdminService();
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState<ServicePayload>(emptyForm);

  function edit(service: Service) {
    setEditing(service);
    setForm({
      name: service.name,
      description: service.description ?? "",
      durationMinutes: service.durationMinutes,
      price: Number(service.price),
      isActive: service.isActive,
      sortOrder: service.sortOrder,
    });
  }
  function reset() {
    setEditing(null);
    setForm(emptyForm);
  }

  if (services.isPending)
    return (
      <EmptyState
        title="Loading services"
        description="Fetching all services including inactive records."
      />
    );
  if (services.isError)
    return <ErrorState description={services.error.message} />;

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>{editing ? "Edit service" : "Create service"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (editing) {
                updateService.mutate(
                  { serviceId: editing.id, input: form },
                  { onSuccess: reset },
                );
                return;
              }
              createService.mutate(form, { onSuccess: reset });
            }}
          >
            <Field label="Name">
              <Input
                value={form.name}
                required
                onChange={(e) =>
                  setForm((v) => ({ ...v, name: e.target.value }))
                }
              />
            </Field>
            <Field label="Description">
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm((v) => ({ ...v, description: e.target.value }))
                }
              />
            </Field>
            <Field label="Duration minutes">
              <Input
                type="number"
                min={1}
                value={form.durationMinutes}
                onChange={(e) =>
                  setForm((v) => ({
                    ...v,
                    durationMinutes: Number(e.target.value),
                  }))
                }
              />
            </Field>
            <Field label="Price">
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.price}
                onChange={(e) =>
                  setForm((v) => ({ ...v, price: Number(e.target.value) }))
                }
              />
            </Field>
            <Field label="Sort order">
              <Input
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) =>
                  setForm((v) => ({ ...v, sortOrder: Number(e.target.value) }))
                }
              />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input
                checked={Boolean(form.isActive)}
                onChange={(e) =>
                  setForm((v) => ({ ...v, isActive: e.target.checked }))
                }
                type="checkbox"
              />{" "}
              Active
            </label>
            {createService.error || updateService.error ? (
              <p className="text-sm text-red-700">
                {createService.error?.message ?? updateService.error?.message}
              </p>
            ) : null}
            <div className="flex gap-2">
              <Button
                disabled={createService.isPending || updateService.isPending}
                type="submit"
              >
                {editing ? "Save" : "Create"}
              </Button>
              {editing ? <Button onClick={reset}>Cancel</Button> : null}
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="grid gap-4">
        {services.data.map((service) => (
          <Card key={service.id}>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <CardTitle>{service.name}</CardTitle>
                <StatusBadge
                  label={service.isActive ? "ACTIVE" : "INACTIVE"}
                  tone={service.isActive ? "success" : "neutral"}
                />
              </div>
            </CardHeader>
            <CardContent className="grid gap-3">
              <p>{service.description}</p>
              <p>
                {formatDuration(service.durationMinutes)} ·{" "}
                {formatPrice(service.price)}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => edit(service)}>Edit</Button>
                {service.isActive ? (
                  <Button
                    disabled={deactivateService.isPending}
                    onClick={() => deactivateService.mutate(service.id)}
                  >
                    Deactivate
                  </Button>
                ) : (
                  <Button
                    onClick={() =>
                      updateService.mutate({
                        serviceId: service.id,
                        input: { isActive: true },
                      })
                    }
                  >
                    Activate
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1 text-sm font-medium">
      {label}
      {children}
    </label>
  );
}
