import Link from "next/link";
import { Suspense } from "react";
import { RegisterForm } from "@/features/auth/components/register-form";

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Suspense fallback={<p>Loading registration form...</p>}>
        <RegisterForm />
      </Suspense>
      <p className="mt-6 text-center text-sm text-[var(--color-muted-foreground)]">
        Already have an account?{" "}
        <Link className="text-[var(--color-primary)]" href="/auth/login">
          Login
        </Link>
      </p>
    </main>
  );
}
