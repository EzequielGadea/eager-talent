import { AlertCircle, ArrowRight } from "lucide-react";

type PublicLinkErrorProps = {
  reason: "not_found" | "expired" | "revoked";
};

export function PublicLinkError({ reason }: PublicLinkErrorProps) {
  const isExpired = reason === "expired" || reason === "revoked";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10">
      <div className="pointer-events-none absolute -left-24 -top-24 size-88 rounded-full bg-emerald-100/70" />
      <div className="pointer-events-none absolute right-[18%] top-[16%] size-52 rounded-full bg-blue-100/50" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 size-104 rounded-full bg-violet-100/60" />

      <div className="relative w-full max-w-105 rounded-3xl border bg-white p-8 shadow-lg">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-violet-500 text-white">
            <ArrowRight className="size-4 -rotate-90" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            EagerTalent
          </span>
        </div>

        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-danger-bg">
            <AlertCircle className="size-6 text-danger" />
          </div>

          <div className="space-y-1">
            <h1 className="text-lg font-semibold text-text-primary">
              {isExpired
                ? "El enlace compartido ha caducado"
                : "Este enlace ya no es válido"}
            </h1>

            <p className="text-sm text-text-secondary">
              {isExpired
                ? "Este enlace público ha vencido o fue revocado por el reclutador. Por favor, solicitá un nuevo enlace para acceder al perfil del candidato."
                : "No pudimos encontrar la información asociada a este enlace. Verificá que la dirección sea correcta."}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
