import { Skeleton } from "~/components/ui/skeleton";
import { UsersTableSkeleton } from "../users/_components/users-table-skeleton";

export function SettingsLayoutSkeleton() {
  return (
    <main className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          Configuración
        </h1>
      </div>

      <div className="flex gap-6 border-b border-border-default pb-3">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-20" />
      </div>

      <section className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-4 w-72" />
          <Skeleton className="h-9 w-36 rounded-full" />
        </div>

        <UsersTableSkeleton />
      </section>
    </main>
  );
}
