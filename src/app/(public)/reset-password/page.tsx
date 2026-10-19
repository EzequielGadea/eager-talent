import { Suspense } from "react";

import { InvalidResetLink } from "./_components/invalid-reset-link";
import { ResetPasswordForm } from "./_components/reset-password-form";

async function ResetPasswordContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParamsPromise;

  if (error || !token) return <InvalidResetLink />;

  return <ResetPasswordForm token={token} />;
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="text-sm text-slate-500">Cargando...</div>
        </div>
      }
    >
      <ResetPasswordContent searchParamsPromise={searchParams} />
    </Suspense>
  );
}
