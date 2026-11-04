import { Suspense } from "react";
import NewApplicantForm from "./_components/new-applicant-form";
import { NewApplicantPageSkeleton } from "./_components/new-applicant-skeleton";
import { auth } from "~/lib/auth";
import { headers } from "next/headers";
import { AccessDenied } from "~/components/access-denied";

export default function newApplicantPage() {
  return (
    <Suspense fallback={<NewApplicantPageSkeleton />}>
      <ProtectedNewApplicantPage />
    </Suspense>
  );
}

async function ProtectedNewApplicantPage() {
  const permission = await auth.api.hasPermission({
    headers: await headers(),
    body: {
      permissions: {
        applicant: ["create"],
      },
    },
  });
  if (!permission.success) {
    return (
      <AccessDenied
        title="No se puede crear el candidato"
        description="No tenés permisos para crear un candidato."
      />
    );
  }
  return (
    <div className="mx-auto w-full max-w-210">
      <h1 className="mb-1 font-heading text-h1 text-text-primary">
        Nuevo candidato
      </h1>
      <p className="mb-5.5 text-sm text-text-secondary">
        Cargá los datos del candidato manualmente. Nombre, apellido email y rol
        son obligatorios.
      </p>
      <NewApplicantForm />
    </div>
  );
}
