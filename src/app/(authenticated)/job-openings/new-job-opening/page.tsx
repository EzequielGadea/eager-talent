import { Suspense } from "react";
import { auth } from "~/lib/auth";
import { headers } from "next/headers";
import { api } from "~/lib/trpc/server";
import NewJobOpeningForm from "./_components/new-job-opening-form";
import NewJobOpeningFallback from "./_components/new-job-opening-fallback";

// const FORM_LOADING_DELAY_MS = 3000;
//const templateStages = api.templateStages.getDefault();
/*const templateStages = {
  id:"0",
  stages: [
    { key:"-1", name: "Aplicado", type:"Ninguna", label:"text", color:"#dddd"},
    { key:"0", name: "Hardcodeado", type: "Entrevista", label: "text",color: "#ff6f"},
    { key:"1", name: "en page.tsx", type: "Entrevista", label: "text",color: "#142f"},
    { key:"2", name: "cambiar por comentado", type: "Entrevista",label: "text",color: "#142f"},
    { key:"3", name: "para traer de DB", type: "Entrevista", label: "text",color: "#142f"},
    { key:"4", name: "manzana", type: "Entrevista", label: "text",color: "#142f"},
    { key:"5", name: "Entrevista Técnica", type: "Entrevista", label: "text",color: "#142f"},
    { key:"6", name: "Entrevista HR", type: "Entrevista", label: "text",color: "#142f"},
    { key:"7", name: "Oferta", type: "Oferta", label: "text",color: "#142f"},
    { key:"8", name: "Contratado/a", type: "Ninguna", label: "text",color: "#142f"},
  ]
}*/

// async function DelayedNewJobOpeningForm() {
//   await new Promise((resolve) => setTimeout(resolve, FORM_LOADING_DELAY_MS));

//   return <NewJobOpeningForm templateStages={ await templateStages } />;
// }

async function NewJobOpeningFormWithTemplateStages() {
  const templateStages = await api.templateStages.getDefault();

  return <NewJobOpeningForm templateStages={templateStages} />;
}

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
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <h1 className="font-heading text-[30px] font-bold leading-[1.2] tracking-[-0.02em] text-text-primary">
          Nueva vacante
        </h1>
        <Suspense fallback={<NewJobOpeningFallback />}>
          {/* Descomentar para probar fallback} <DelayedNewJobOpeningForm /> {*/}
          <NewJobOpeningFormWithTemplateStages />
        </Suspense>
      </div>
    </>
  );
}
