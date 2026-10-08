"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "~/components/ui/button";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function SettingsError({ error, reset }: Props) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-danger-bg">
        <AlertTriangle className="size-6 text-danger" />
      </div>

      <div className="space-y-2">
        <h2 className="font-heading text-xl font-semibold text-text-primary">
          Ocurrió un error
        </h2>

        <p className="max-w-md text-sm text-text-secondary">
          No pudimos cargar esta sección. Intentá nuevamente.
        </p>
      </div>

      <Button
        type="button"
        onClick={() => reset()}
        className="rounded-full bg-dashboard-dark text-text-on-dark hover:bg-dashboard-dark-hover"
      >
        Reintentar
      </Button>
    </div>
  );
}