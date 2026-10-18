import { TriangleAlert } from "lucide-react";
import { Button } from "~/components/ui/button";
import { InviteShell } from "./invite-shell";

export function InvalidToken() {
  return (
    <InviteShell>
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
      <Button
        render={<a href="/login">Ir a iniciar sesión</a>}
        variant="outline"
        className="mt-6 h-11 w-full rounded-full"
      />
    </InviteShell>
  );
}
