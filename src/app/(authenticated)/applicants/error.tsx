"use client";

import { Button } from "~/components/ui/button";

export function ApplicantErrorForbidden() {
  return (
    <>
      <section role="alert" className="space-y-4 rounded-xl border p-6">
        <h1 className="text-xl font-semibold">
          Solo los reclutadores pueden consultar candidatos
        </h1>
        <p className="text-gray-600">
          Si eres un reclutador, por favor inicia sesión con tu cuenta de
          reclutador para poder acceder a esta sección.
        </p>
      </section>
    </>
  );
}

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
          if (reset) {
            reset();
          } else {
            window.location.reload();
          }
        }}
      >
        Reintentar
      </Button>
    </section>
  );
}
