"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { FetchErrorState } from "~/components/fetch-error-state";

// Error state of the HR and technical deviation cards. Retrying refreshes the
// server data in place, so the area and period in the URL are kept.
export function StageDeviationsError() {
  const router = useRouter();
  const [isRetrying, startTransition] = useTransition();

  return (
    <FetchErrorState
      size="compact"
      description="No se pudo cargar esta métrica."
      isRetrying={isRetrying}
      onRetry={() => startTransition(() => router.refresh())}
    />
  );
}
