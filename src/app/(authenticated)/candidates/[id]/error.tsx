"use client";

import { Alert, AlertTitle, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";

export default function CandidateError({ reset }: { reset: () => void }) {
  return (
    <Alert className="flex flex-col items-start gap-4">
      <AlertTitle>
        <h1>No pudimos cargar el perfil</h1>
      </AlertTitle>
      <AlertDescription>
        Ocurrió un error. Podés volver a intentarlo.
      </AlertDescription>
      <Button variant="outline" onClick={reset}>
        Reintentar
      </Button>
    </Alert>
  );
}
