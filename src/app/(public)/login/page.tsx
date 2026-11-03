import type { Metadata } from "next";

import { LoginForm } from "./_components/login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión | EagerTalent",
};

export default function LoginPage() {
  return (
    <main className="relative isolate flex min-h-full flex-1 items-center justify-center overflow-hidden bg-surface-subtle text-text-primary">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-28 size-105 rounded-full bg-success-bg/60 blur-md"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-24 right-[18%] size-55 rounded-full bg-info-bg/80 blur-md"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -bottom-28 size-95 rounded-full bg-tag-purple-bg/60 blur-md"
      />

      <LoginForm />
    </main>
  );
}
