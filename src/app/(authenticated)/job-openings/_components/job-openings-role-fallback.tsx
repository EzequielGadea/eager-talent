import { Skeleton } from "~/components/ui/skeleton";

export function JobOpeningsRoleFallback() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="mx-auto flex w-full flex-col gap-5 p-6"
    >
      <span className="sr-only">Cargando vacantes</span>
      <Skeleton className="h-8 w-44" />
      <Skeleton className="h-4 w-64 max-w-full" />
      <Skeleton className="h-100 w-full rounded-xl" />
    </div>
  );
}
