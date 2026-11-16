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
    <>
      <div className="mx-auto mb-0 flex w-full max-w-[1440px] flex-col gap-4 p-4">
        <h1 className="font-heading text-[30px] font-bold leading-[1.2] tracking-[-0.02em] text-text-primary">
          Nuevo candidato
        </h1>
        <p className="mt-0 text-sm text-text-secondary">
          Cargá los datos del candidato manualmente. Nombre, apellido email y
          rol son obligatorios.
        </p>
      </div>
      <NewApplicantForm />
    </>
  );
}
