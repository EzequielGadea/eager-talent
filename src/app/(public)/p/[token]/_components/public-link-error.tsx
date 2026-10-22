import { AlertTriangle, Clock } from "lucide-react";

type PublicLinkErrorProps = {
  reason: "not_found" | "expired" | "revoked";
};

export function PublicLinkError({ reason }: PublicLinkErrorProps) {
  const isExpired = reason === "expired" || reason === "revoked";

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center px-4">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-4">
        {isExpired ? (
          <Clock className="size-7" />
        ) : (
          <AlertTriangle className="size-7" />
        )}
      </div>

      <h1 className="text-xl font-bold text-text-primary">
        {isExpired ? "El enlace compartido ha caducado" : "Enlace no válido"}
      </h1>

      <p className="mt-2 max-w-md text-sm text-text-secondary">
        {isExpired
          ? "Este enlace público ha vencido o fue revocado por el reclutador. Por favor, solicitá un nuevo enlace para acceder al perfil del candidato."
          : "No pudimos encontrar la información asociada a este enlace. Verificá que la dirección sea correcta."}
      </p>
    </div>
  );
}
