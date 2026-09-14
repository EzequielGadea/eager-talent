import Link from "next/link";
import { buttonVariants } from "~/components/ui/button";

export default function CandidateNotFound() {
  return (
    <section className="space-y-4 rounded-xl border p-6">
      <h1 className="text-xl font-semibold">Candidato no encontrado</h1>
      <p className="text-muted-foreground">
        El candidato no existe o no tenés acceso a su perfil.
      </p>
      <Link
        href="/dashboard"
        className={buttonVariants({ variant: "outline" })}
      >
        Volver al inicio
      </Link>
    </section>
  );
}
