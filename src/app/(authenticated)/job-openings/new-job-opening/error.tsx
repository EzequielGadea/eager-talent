"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

type JobOpeningErrorProps = {
  reset: () => void;
  error: Error & {
    digest?: string;
    code?: string;
  }
};

export default function JobOpeningError({ reset, error }: JobOpeningErrorProps) {
    let title = "Error inesperado"
    let message = "Algo salio mal, intentalo nuevamente mas tarde."
    switch(error.message) {
        case "CONFLICT": {
            title = "No se pudo crear la vacante";
            message = "Ya existía la vacante";
            break;
        }
        case "NOT_FOUND": {
            title = "No se pudo crear la vacante";
            message = "El área, seniority o hiring manager indicado no existe";
            break;
        }
        case "FORBIDDEN": {
            title = "No tienes permiso para crear vacantes";
            message = "Ingresa con tu usuario de recruiter para acceder a esta función.";
            break;
        }
    }
  return (
    <main className="flex min-h-0 flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-danger-bg">
            <AlertCircle className="size-6 text-danger" />
          </div>

          <div className="space-y-1">
            <h1 className="text-lg font-semibold text-text-primary">
              {title}
            </h1>

            <p className="text-sm text-text-secondary">
              {message}
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
