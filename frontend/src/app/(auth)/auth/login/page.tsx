import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/login-form";

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Suspense fallback={<p>Loading login form...</p>}>
        <LoginForm />
      </Suspense>
      <p className="mt-6 text-center text-sm text-[var(--color-muted-foreground)]">
        Need an account?{" "}
        <Link className="text-[var(--color-primary)]" href="/auth/register">
          Register
        </Link>
      </p>
    </main>
  );
}
