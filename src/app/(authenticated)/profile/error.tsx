"use client";

import { Button } from "~/components/ui/button";

export default function ProfileError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-2xl space-y-4 rounded-xl border border-border-default bg-surface-card p-6 shadow-sm">
      <div className="space-y-1">
        <h2 className="font-heading text-base font-semibold text-text-primary">
          No se pudo cargar tu perfil
        </h2>
        <p className="text-sm text-text-secondary">
          Ocurrió un error al obtener tu información. Intentá nuevamente.
        </p>
      </div>
      <Button type="button" variant="outline" onClick={reset}>
        Reintentar
      </Button>
    </div>
  );
}
