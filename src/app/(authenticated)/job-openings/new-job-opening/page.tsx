import { Suspense } from "react";
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
      <main className="flex min-h-0 flex-1 items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-lg font-semibold text-text-primary">
            No se puede crear la vacante
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            No tenés permisos para crear una vacante.
          </p>
        </div>
      </main>
    );
  }
  return (
    <>
      <div className="mx-auto mb-0 flex w-full max-w-[1440px] flex-col gap-4 p-4">
        <h1 className="mb-0 text-2xl --text-primary --font-heading">
          Nueva vacante
        </h1>
        <Suspense fallback={<NewJobOpeningFallback />}>
          <NewJobOpeningFormWithTemplateStages />
        </Suspense>
      </div>
    </>
  );
}
