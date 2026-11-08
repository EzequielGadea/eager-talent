"use client";

import { useEffect } from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";

import { StatusCard } from "~/components/status-card";
import { Button } from "~/components/ui/button";

export default function RootError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusCard
      code={error.digest ? `Código ${error.digest}` : "Error 500"}
      icon={<TriangleAlert className="size-6" aria-hidden="true" />}
      title="Algo salió mal"
      description="Ocurrió un error inesperado. Intentá nuevamente y, si el problema persiste, contactá a tu equipo de soporte."
    >
      <Button
        type="button"
        variant="outline"
        onClick={retry}
        className="mt-2 h-11 w-full rounded-full"
      >
        <RefreshCw className="size-4" />
        Intentar nuevamente
      </Button>
    </StatusCard>
  );
}
