import { Shell, TriangleAlert } from "lucide-react";
import { Button } from "~/components/ui/button";

export function InvalidToken() {
  return (
    <Shell>
      <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-red-50 text-red-600">
        <TriangleAlert className="size-5" />
      </div>
      <h1 className="text-xl font-bold tracking-tight text-slate-900">
        Este link ya no es válido
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        La invitación venció o ya fue usada. Pedile a quien te invitó que te
        envíe una nueva y volvé a abrir el link del mail.
      </p>
      <Button variant="outline" className="mt-6 h-11 w-full rounded-full">
        <a href="/login">Ir a iniciar sesión</a>
      </Button>
    </Shell>
  );
}
