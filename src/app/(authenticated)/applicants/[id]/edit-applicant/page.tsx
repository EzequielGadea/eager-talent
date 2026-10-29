import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "~/lib/auth";

import EditApplicantForm from "./_components/edit-applicant-form";
import { EditApplicantPageSkeleton } from "./_components/edit-applicant-skeleton";

export default function EditApplicantPage() {
  return (
    <Suspense fallback={<EditApplicantPageSkeleton />}>
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
      <div className="mx-auto mb-0 flex w-full max-w-[1440px] flex-col gap-4 p-4">
        <h1 className="mb-0 font-heading text-2xl font-bold leading-[1.2] tracking-[-0.02em] text-dashboard-dark">
          Editar candidato
        </h1>
      </div>

      <EditApplicantForm />
    </>
  );
}
