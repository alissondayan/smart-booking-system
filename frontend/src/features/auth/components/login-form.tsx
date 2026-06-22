"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useLogin } from "../hooks/use-auth-actions";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const returnTo = searchParams.get("returnTo");

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            login.mutate(
              { email, password },
              {
                onSuccess: (response) => {
                  router.push(returnTo ?? (response.user.role === "OWNER" ? "/admin" : "/account/appointments"));
                },
              },
            );
          }}
        >
          <label className="grid gap-2 text-sm font-medium">
            Email
            <Input autoComplete="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Password
            <Input
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>
          {login.error ? <p className="text-sm text-red-700">{login.error.message}</p> : null}
          <Button disabled={login.isPending} type="submit">
            {login.isPending ? "Logging in..." : "Login"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
