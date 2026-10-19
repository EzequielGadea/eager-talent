import Link from "next/link";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "~/components/ui/empty";
import { buttonVariants } from "~/components/ui/button";

export default function InterviewNotFound() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>
          <h1>Entrevista no encontrada</h1>
        </EmptyTitle>
        <EmptyDescription>
          La entrevista no existe o no tenés acceso a ella.
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
