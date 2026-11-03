import { ShieldAlert } from "lucide-react";

type AccessDeniedProps = {
  title?: string;
  description?: string;
};

export function AccessDenied({
  title = "No tenés acceso a esta sección",
  description = "Tu rol no tiene permisos para ver esta página.",
}: AccessDeniedProps) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center p-6">
      <div className="relative w-full max-w-105 rounded-3xl border bg-surface-card p-8 shadow-lg">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-danger-bg">
            <ShieldAlert className="size-6 text-danger" />
          </div>

          <div className="space-y-1">
            <h1 className="font-heading text-h3 text-text-primary">{title}</h1>

            <p className="text-sm text-text-secondary">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
