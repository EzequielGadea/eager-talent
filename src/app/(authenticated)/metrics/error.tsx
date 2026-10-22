"use client";

import { Button } from "~/components/ui/button";

export default function MetricsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="flex min-h-80 flex-col items-center justify-center gap-4 text-center">
      <h1 className="font-heading text-xl font-semibold text-text-primary">
        No se pudieron cargar las métricas
      </h1>
      <p className="max-w-md text-sm text-text-secondary">
        Ocurrió un error al consultar los datos. Intentá nuevamente.
      </p>
      <Button variant="outline" onClick={reset}>
        Reintentar
      </Button>
    </section>
  );
}
