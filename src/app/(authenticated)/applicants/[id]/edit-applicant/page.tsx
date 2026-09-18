import { Suspense } from "react";
import EditApplicantForm from "./_components/edit-applicant-form";

export default function EditApplicantPage() {
  return (
    <>
      <div className="mx-auto mb-0 flex w-full max-w-4xl flex-col gap-4 p-4">
        <h1 className="mb-0 text-2xl --text-primary">
          Editar candidato
        </h1>
      </div>

      <Suspense fallback={<div>Cargando candidato...</div>}>
        <EditApplicantForm />
      </Suspense>
    </>
  );
}
