import { AlertCircle } from "lucide-react";

export default function ApplicantNotFound() {
  return (
    <main className="flex min-h-0 flex-1 items-center justify-center p-6">
      <div className="relative w-full max-w-105 rounded-3xl border bg-surface-card p-8 shadow-lg">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-danger-bg">
            <AlertCircle className="size-6 text-danger" />
          </div>

          <div className="space-y-1">
            <h1 className="text-h3 text-text-primary">
              Candidato no encontrado
            </h1>

            <p className="text-sm text-text-secondary">
              El candidato no existe o no tenés acceso a él.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
