"use client";

import { Button } from "~/components/ui/button";

export default function ApplicantTableError({ reset }: { reset?: () => void }) {
  return (
    <section role="alert" className="space-y-4 rounded-xl border p-6">
      <h1 className="text-xl font-semibold">
        No pudimos cargar la tabla de candidatos
      </h1>
      <p className="text-muted-foreground">
        Ocurrió un error. Podés volver a intentarlo.
      </p>
      <Button
        variant="outline"
        onClick={() => {
          window.location.reload();
        }}
      >
        Reintentar
      </Button>
    </section>
  );
}
