"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

type JobOpeningErrorProps = {
  reset: () => void;
};

export default function JobOpeningError({ reset }: JobOpeningErrorProps) {
  return (
    <main className="flex min-h-0 flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-danger-bg">
            <AlertCircle className="size-6 text-danger" />
          </div>

          <div className="space-y-1">
            <h1 className="text-lg font-semibold text-text-primary">
              No se pudo cargar la vacante
            </h1>

            <p className="text-sm text-text-secondary">
              No tenés permisos para acceder a esta información u ocurrió un
              error inesperado.
            </p>
          </div>

          <Button type="button" onClick={reset}>
            <RefreshCw className="size-4" />
            Intentar nuevamente
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
