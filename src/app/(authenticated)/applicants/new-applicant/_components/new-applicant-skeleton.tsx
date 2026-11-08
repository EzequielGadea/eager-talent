import { EditApplicantFormSkeleton } from "../../[id]/edit-applicant/_components/edit-applicant-skeleton";

export function NewApplicantPageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-210">
      <h1 className="mb-1 font-heading text-h1 text-text-primary">
        Nuevo candidato
      </h1>
      <p className="mb-5.5 text-sm text-text-secondary">
        Cargá los datos del candidato manualmente. Nombre, apellido email y rol
        son obligatorios.
      </p>

      <EditApplicantFormSkeleton />
    </div>
  );
}
