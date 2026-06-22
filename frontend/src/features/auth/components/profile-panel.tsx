"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/use-auth";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export function ProfilePanel() {
  const auth = useAuth();
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5">
        {auth.user ? (
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Name</dt>
              <dd className="font-medium text-[var(--color-foreground)]">
                {auth.user.firstName} {auth.user.lastName}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Email</dt>
              <dd className="font-medium text-[var(--color-foreground)]">{auth.user.email}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Role</dt>
              <dd className="font-medium text-[var(--color-foreground)]">{auth.user.role}</dd>
            </div>
            {auth.user.phone ? (
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Phone</dt>
                <dd className="font-medium text-[var(--color-foreground)]">{auth.user.phone}</dd>
              </div>
            ) : null}
          </dl>
        ) : (
          <p>Loading profile...</p>
        )}
        <Button
          onClick={() => {
            auth.clearSession();
            router.push("/");
          }}
        >
          Logout
        </Button>
      </CardContent>
    </Card>
  );
}
