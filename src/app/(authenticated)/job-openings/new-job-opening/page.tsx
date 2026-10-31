import { Suspense } from "react";
import { ShieldAlert } from "lucide-react";
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
        <div className="relative w-full max-w-105 rounded-3xl border bg-white p-8 shadow-lg">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-danger-bg">
              <ShieldAlert className="size-6 text-danger" />
            </div>

            <div className="space-y-1">
              <h1 className="text-lg font-semibold text-text-primary">
                No se puede crear la vacante
              </h1>
              <p className="text-sm text-text-secondary">
                No tenés permisos para crear una vacante.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }
  return (
    <>
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5">
        <h1 className="font-heading text-[30px] font-bold leading-[1.2] tracking-[-0.02em] text-text-primary">
          Nueva vacante
        </h1>
        <Suspense fallback={<NewJobOpeningFallback />}>
          <NewJobOpeningFormWithTemplateStages />
        </Suspense>
      </div>
    </>
  );
}
