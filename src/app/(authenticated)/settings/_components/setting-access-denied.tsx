import { ShieldAlert } from "lucide-react";

export function SettingsAccessDenied() {
  return (
    <main className="flex min-h-0 flex-1 items-center justify-center p-6">
      <div className="relative w-full max-w-105 rounded-3xl border bg-white p-8 shadow-lg">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-danger-bg">
            <ShieldAlert className="size-6 text-danger" />
          </div>

          <div className="space-y-1">
            <h1 className="text-lg font-semibold text-text-primary">
              No tenés acceso a Configuración
            </h1>

            <p className="text-sm text-text-secondary">
              Esta sección está disponible únicamente para usuarios con rol
              Recruiter.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
