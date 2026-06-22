"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useRegister } from "../hooks/use-auth-actions";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const register = useRegister();
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
  });

  const returnTo = searchParams.get("returnTo");

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Create account</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            register.mutate(
              {
                email: form.email,
                password: form.password,
                firstName: form.firstName,
                lastName: form.lastName,
                phone: form.phone || undefined,
              },
              {
                onSuccess: () => {
                  router.push(returnTo ?? "/account/appointments");
                },
              },
            );
          }}
        >
          <label className="grid gap-2 text-sm font-medium">
            First name
            <Input onChange={(event) => setForm((value) => ({ ...value, firstName: event.target.value }))} required value={form.firstName} />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Last name
            <Input onChange={(event) => setForm((value) => ({ ...value, lastName: event.target.value }))} required value={form.lastName} />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Email
            <Input autoComplete="email" onChange={(event) => setForm((value) => ({ ...value, email: event.target.value }))} required type="email" value={form.email} />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Phone
            <Input autoComplete="tel" onChange={(event) => setForm((value) => ({ ...value, phone: event.target.value }))} value={form.phone} />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Password
            <Input
              autoComplete="new-password"
              minLength={8}
              onChange={(event) => setForm((value) => ({ ...value, password: event.target.value }))}
              required
              type="password"
              value={form.password}
            />
          </label>
          {register.error ? <p className="text-sm text-red-700">{register.error.message}</p> : null}
          <Button disabled={register.isPending} type="submit">
            {register.isPending ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
