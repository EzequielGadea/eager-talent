import { Suspense } from "react";
import { auth } from "~/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import NewJobOpeningForm from "./_components/new-job-opening-form";
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
  //const templateStages = await api.templateStages.getDefault()
  const templateStages = {
    id:"0",
    stages: [{
        key: "key",
        name: "name",
        type: "type",
        label: "label",
    }]}
  return (
    <>
      <div className="mx-auto mb-0 flex w-full max-w-[1440px] flex-col gap-4 p-4">
        <h1 className="mb-0 text-2xl --text-primary --font-heading">
          Nueva vacante
        </h1>
        <NewJobOpeningForm templateStages={templateStages}/>
      </div>
    </>
  );
}
