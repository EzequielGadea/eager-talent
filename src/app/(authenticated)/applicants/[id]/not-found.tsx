import Link from "next/link";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "~/components/ui/empty";
import { buttonVariants } from "~/components/ui/button";

export default function ApplicantNotFound() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>
          <h1>Candidato no encontrado</h1>
        </EmptyTitle>
        <EmptyDescription>
          El candidato no existe o no tenés acceso a su perfil.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link
          href="/dashboard"
          className={buttonVariants({ variant: "outline" })}
        >
          Volver al inicio
        </Link>
      </EmptyContent>
    </Empty>
  );
}
