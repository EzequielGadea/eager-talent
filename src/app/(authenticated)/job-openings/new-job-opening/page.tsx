import { Suspense } from "react";
import { AccessDenied } from "~/components/access-denied";
import { auth } from "~/lib/auth";
import { headers } from "next/headers";
import { api } from "~/lib/trpc/server";
import NewJobOpeningForm from "./_components/new-job-opening-form";
import NewJobOpeningFallback, {
  NewJobOpeningPageFallback,
} from "./_components/new-job-opening-fallback";

async function NewJobOpeningFormWithTemplateStages() {
  const templateStages = await api.templateStages.getDefault();

  return <NewJobOpeningForm templateStages={templateStages} />;
}

export default function newJobOpeningPage() {
  return (
    <Suspense fallback={<NewJobOpeningPageFallback />}>
      <ProtectedNewJobOpeningPage />
    </Suspense>
  );
}

async function ProtectedNewJobOpeningPage() {
  const permission = await auth.api.hasPermission({
    headers: await headers(),
    body: {
      permissions: {
        jobOpening: ["create"],
      },
    },
  });
  if (!permission.success) {
    return (
      <AccessDenied
        title="No se puede crear la vacante"
        description="No tenés permisos para crear una vacante."
      />
    );
  }
  return (
    <>
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5">
        <h1 className="font-heading text-h1 text-text-primary">
          Nueva vacante
        </h1>
        <Suspense fallback={<NewJobOpeningFallback />}>
          <NewJobOpeningFormWithTemplateStages />
        </Suspense>
      </div>
    </>
  );
}
