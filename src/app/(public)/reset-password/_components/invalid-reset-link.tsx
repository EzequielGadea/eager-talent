import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";

import { ResetPasswordShell } from "./reset-password-shell";

export function InvalidResetLink() {
  return (
    <ResetPasswordShell>
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-danger-bg">
          <AlertCircle className="size-6 text-danger" />
        </div>

        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-text-primary">
            Este enlace ya no es válido
          </h1>

          <p className="text-sm text-text-secondary">
            El enlace venció, ya fue utilizado o fue reemplazado por uno más
            reciente. Solicitá un nuevo correo de restablecimiento a un
            Recruiter.
          </p>
        </div>

        <Link
          href="/login"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "mt-2 h-11 w-full rounded-full",
          )}
        >
          Ir a iniciar sesión
        </Link>
      </div>
    </ResetPasswordShell>
  );
}
