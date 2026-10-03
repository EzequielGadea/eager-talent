import { Suspense } from "react";
import NewApplicantForm from "./_components/new-applicant-form";
import { auth } from "~/lib/auth";
import { headers } from "next/headers";

import { redirect } from "next/navigation";

export default function newApplicantPage() {
  return (
    <Suspense>
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
    redirect("/dashboard");
  }
  return (
    <>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4 mb-0">
        <h1 className="mb-0 text-2xl --text-primary">Nuevo candidato</h1>
        <p className="text-text-secondary mt-0 text-sm">
          Cargá los datos del candidato manualmente. Nombre, apellido email y
          rol son obligatorios.
        </p>
      </div>
      <NewApplicantForm />
    </>
  );
}
