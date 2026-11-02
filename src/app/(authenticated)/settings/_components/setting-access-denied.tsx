import { AccessDenied } from "~/components/access-denied";

export function SettingsAccessDenied() {
  return (
    <AccessDenied
      title="No tenés acceso a Configuración"
      description="Esta sección está disponible únicamente para usuarios con rol Recruiter."
    />
  );
}
