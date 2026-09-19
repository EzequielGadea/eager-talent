import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "~/lib/auth";

import EditApplicantForm from "./_components/edit-applicant-form";

export default function EditApplicantPage() {
  return (
    <Suspense fallback={<div>Cargando candidato...</div>}>
      <ProtectedEditApplicantPage />
    </Suspense>
  );
}

async function ProtectedEditApplicantPage() {
  const permission = await auth.api.hasPermission({
    headers: await headers(),
    body: {
      permissions: {
        applicant: ["update"],
      },
    },
  });

  if (!permission.success) {
    redirect("/dashboard");
  }

  return (
    <>
      <div className="mx-auto mb-0 flex w-full max-w-4xl flex-col gap-4 p-4">
        <h1 className="mb-0 text-2xl --text-primary">Editar candidato</h1>
      </div>

      <EditApplicantForm />
    </>
  );
}
