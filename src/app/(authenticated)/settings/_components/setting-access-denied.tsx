import { ShieldAlert } from "lucide-react";

export function SettingsAccessDenied() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex max-w-md flex-col items-center gap-4 rounded-xl border border-border-default bg-surface-card p-10 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-danger-bg">
          <ShieldAlert className="size-6 text-danger" />
        </div>

        <div className="space-y-2">
          <h2 className="font-heading text-xl font-semibold text-text-primary">
            No tenés acceso a Configuración
          </h2>

          <p className="text-sm text-text-secondary">
            Esta sección está disponible únicamente para usuarios con rol
            Recruiter.
          </p>
        </div>
      </div>
    </div>
  );
}
