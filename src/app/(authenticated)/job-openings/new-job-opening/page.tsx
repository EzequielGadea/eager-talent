import { Suspense } from "react";
import { auth } from "~/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import NewJobOpeningForm from "./_components/new-job-opening-form";
import NewJobOpeningFallback from "./_components/new-job-opening-fallback";

const FORM_LOADING_DELAY_MS = 3000;
const templateStages = await api.templateStages.getDefault();
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


async function DelayedNewJobOpeningForm() {
  await new Promise((resolve) => setTimeout(resolve, FORM_LOADING_DELAY_MS));

  return <NewJobOpeningForm templateStages={ templateStages } />;
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
  return (
    <>
      <div className="mx-auto mb-0 flex w-full max-w-[1440px] flex-col gap-4 p-4">
        <h1 className="mb-0 text-2xl --text-primary --font-heading">
          Nueva vacante
        </h1>
        <Suspense fallback={<NewJobOpeningFallback />}>
          {/* Descomentar para probar fallback} <DelayedNewJobOpeningForm /> {*/}
          <NewJobOpeningForm templateStages={ templateStages } />
        </Suspense>
      </div>
    </>
  );
}
