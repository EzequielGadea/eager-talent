import Link from "next/link";
import { TriangleAlert } from "lucide-react";

import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";

import { ResetPasswordShell } from "./reset-password-shell";

export function InvalidResetLink() {
  return (
    <ResetPasswordShell>
      <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-red-50 text-red-600">
        <TriangleAlert className="size-5" />
      </div>
      <h1 className="text-xl font-bold tracking-tight text-slate-900">
        Este enlace ya no es válido
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        El enlace venció, ya fue utilizado o fue reemplazado por uno más
        reciente. Solicitá un nuevo correo de restablecimiento a un Recruiter.
      </p>
      <Link
        href="/login"
        className={cn(
          buttonVariants({ variant: "outline" }),
          "mt-6 h-11 w-full rounded-full",
        )}
      >
        Ir a iniciar sesión
      </Link>
    </ResetPasswordShell>
  );
}
