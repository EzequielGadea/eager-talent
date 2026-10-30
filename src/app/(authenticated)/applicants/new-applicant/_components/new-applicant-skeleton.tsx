import { EditApplicantFormSkeleton } from "../../[id]/edit-applicant/_components/edit-applicant-skeleton";

export function NewApplicantPageSkeleton() {
  return (
    <>
      <div className="mx-auto mb-0 flex w-full max-w-[1440px] flex-col gap-4 p-4">
        <h1 className="mb-0 font-heading text-2xl font-bold leading-[1.2] tracking-[-0.02em] text-dashboard-dark">
          Nuevo candidato
        </h1>
        <p className="mt-0 text-sm text-text-secondary">
          Cargá los datos del candidato manualmente. Nombre, apellido email y
          rol son obligatorios.
        </p>
      </div>

      <EditApplicantFormSkeleton />
    </>
  );
}
