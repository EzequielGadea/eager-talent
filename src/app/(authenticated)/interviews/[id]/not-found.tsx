import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export default function InterviewNotFound() {
  return (
    <main className="flex min-h-0 flex-1 items-center justify-center p-6">
      <div className="relative w-full max-w-105 rounded-3xl border bg-white p-8 shadow-lg">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-danger-bg">
            <AlertCircle className="size-6 text-danger" />
          </div>

          <div className="space-y-1">
            <h1 className="text-lg font-semibold text-text-primary">
              Entrevista no encontrada
            </h1>

            <p className="text-sm text-text-secondary">
              La entrevista no existe o no tenés acceso a ella.
            </p>
          </div>

          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "mt-2 h-11 w-full rounded-full",
            )}
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
