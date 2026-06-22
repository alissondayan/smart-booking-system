"use client";

import { useState } from "react";
import { useBusinessProfile } from "@/features/business/profile/hooks/use-business-profile";
import type { BusinessProfile } from "@/shared/types/api";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { Input } from "@/shared/ui/input";
import {
  useUpdateBusiness,
  useUploadBusinessLogo,
} from "../hooks/use-admin-business";

export function AdminBusinessPanel() {
  const profile = useBusinessProfile();

  if (profile.isPending) {
    return (
      <EmptyState
        title="Loading business"
        description="Fetching business profile."
      />
    );
  }

  if (profile.isError) {
    return <ErrorState description={profile.error.message} />;
  }

  return <BusinessProfileForm profile={profile.data} />;
}

function BusinessProfileForm({ profile }: { profile: BusinessProfile }) {
  const update = useUpdateBusiness();
  const upload = useUploadBusinessLogo();
  const [form, setForm] = useState({
    name: profile.name,
    description: profile.description ?? "",
    phone: profile.phone,
    email: profile.email,
    address: profile.address ?? "",
    website: profile.website ?? "",
    timezone: profile.timezone,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            update.mutate({ ...form });
          }}
        >
          {Object.entries(form).map(([key, value]) => (
            <label className="grid gap-1 text-sm font-medium" key={key}>
              {key}
              <Input
                value={value}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    [key]: event.target.value,
                  }))
                }
              />
            </label>
          ))}
          <Button disabled={update.isPending} type="submit">
            Save profile
          </Button>
          {update.error ? (
            <p className="text-sm text-red-700">{update.error.message}</p>
          ) : null}
        </form>
        <div className="mt-6 grid gap-3">
          <p className="font-medium">Logo upload</p>
          <Input
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) upload.mutate(file);
            }}
            type="file"
          />
          {upload.error ? (
            <p className="text-sm text-red-700">{upload.error.message}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
