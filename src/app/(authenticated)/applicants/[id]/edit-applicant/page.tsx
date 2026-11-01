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

  return <EditApplicantForm />;
}
