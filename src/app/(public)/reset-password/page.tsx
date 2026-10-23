import { Suspense } from "react";

import { Skeleton } from "~/components/ui/skeleton";
import { InvalidResetLink } from "./_components/invalid-reset-link";
import { ResetPasswordForm } from "./_components/reset-password-form";
import { ResetPasswordShell } from "./_components/reset-password-shell";

async function ResetPasswordContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParamsPromise;

  if (error || !token) return <InvalidResetLink />;

  return <ResetPasswordForm token={token} />;
}

function ResetPasswordFallback() {
  return (
    <ResetPasswordShell>
      <div className="space-y-2">
        <Skeleton className="h-6 w-52" />
        <Skeleton className="h-4 w-4/5" />
      </div>

      <div className="mt-6 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>

        <Skeleton className="h-11 w-full rounded-full" />
      </div>
    </ResetPasswordShell>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordContent searchParamsPromise={searchParams} />
    </Suspense>
  );
}
