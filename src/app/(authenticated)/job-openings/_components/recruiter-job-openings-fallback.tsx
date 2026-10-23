import { Skeleton } from "~/components/ui/skeleton";

export function RecruiterJobOpeningsFallback() {
  return (
    <div aria-busy="true" className="mx-auto flex w-full flex-col gap-5 p-6">
      <span className="sr-only">Cargando vacantes</span>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold leading-[1.2] tracking-[-0.02em] text-dashboard-dark">
            Vacantes
          </h1>

          <div className="mt-2 flex items-center gap-2">
            <Skeleton className="h-4 w-64" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8.5 w-36 rounded-full" />
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-xl border border-dashboard-border bg-background shadow-sm">
        <div className="border-b border-dashboard-border bg-(--surface-subtle) px-4 py-3">
          <div className="flex items-center gap-8">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>

        <div className="divide-y divide-dashboard-border">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex h-16 items-center justify-between gap-8 px-4"
            >
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="ml-auto size-4" />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-dashboard-border px-4 py-3">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-7.5 w-40 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
