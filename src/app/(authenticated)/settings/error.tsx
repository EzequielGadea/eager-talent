"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

import { Button } from "~/components/ui/button";

export default function SettingsError({ retry }: { retry: () => void }) {
  return (
    <main className="flex min-h-0 flex-1 items-center justify-center p-6">
      <div className="relative w-full max-w-105 rounded-3xl border bg-white p-8 shadow-lg">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-danger-bg">
            <AlertCircle className="size-6 text-danger" />
          </div>

          <div className="space-y-1">
            <h1 className="text-lg font-semibold text-text-primary">
              No se pudo cargar la configuración
            </h1>

            <p className="text-sm text-text-secondary">
              Ocurrió un error inesperado. Intentá nuevamente.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={retry}
            className="mt-2 h-11 w-full rounded-full"
          >
            <RefreshCw className="size-4" />
            Intentar nuevamente
          </Button>
        </div>
      </div>
    </main>
  );
}
