import { Suspense } from "react";
import { auth } from "~/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import NewJobOpeningForm from "./_components/new-job-opening-form";
import NewJobOpeningFallback from "./_components/new-job-opening-fallback";

const FORM_LOADING_DELAY_MS = 3000;

async function DelayedNewJobOpeningForm() {
  await new Promise((resolve) => setTimeout(resolve, FORM_LOADING_DELAY_MS));

  return <NewJobOpeningForm />;
}

import { api } from "~/lib/trpc/server";
export default function newJobOpeningPage() {
  return (
    <Suspense>
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
    redirect("/dashboard");
  }
  //TODO Mantener solo la version de DB cuando haya objeto
  const templateStages = await api.templateStages.getDefault()
  /*const templateStages = {
    id:"0",
    stages: [
    { key:"0", name: "Hardcodeado", type: "Entrevista", label: "text",color: "#ff6f"},
    { key:"1", name: "en page.tsx", type: "Entrevista", label: "text",color: "#142f"},
    { key:"2", name: "cambiar por comentado", type: "Entrevista",label: "text",color: "#142f"},
    { key:"3", name: "para traer de DB", type: "Entrevista", label: "text",color: "#142f"},
    { key:"4", name: "manzana", type: "Entrevista", label: "text",color: "#142f"},
    ]
  }*/
  return (
    <>
      <div className="mx-auto mb-0 flex w-full max-w-[1440px] flex-col gap-4 p-4">
        <h1 className="mb-0 text-2xl --text-primary --font-heading">
          Nueva vacante
        </h1>
        <Suspense fallback={<NewJobOpeningFallback />}>
          {/* Descomentar para probar fallback} <DelayedNewJobOpeningForm /> {*/}
          <NewJobOpeningForm />
        </Suspense>
      </div>
    </>
  );
}
