import { Skeleton } from "~/components/ui/skeleton";

export function HiringManagerJobOpeningsFallback() {
  return (
    <div aria-busy="true" className="mx-auto flex w-full flex-col gap-5 p-6">
      <span className="sr-only">Cargando tus vacantes</span>

      <div>
        <h1 className="font-heading text-2xl font-bold leading-[1.2] tracking-[-0.02em] text-dashboard-dark">
          Mis vacantes
        </h1>

        <div className="mt-2 flex items-center gap-2">
          <Skeleton className="h-4 w-full max-w-64" />
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-xl border border-dashboard-border bg-background shadow-sm">
        <div className="border-b border-dashboard-border bg-(--surface-subtle) px-4 py-3">
          <div className="flex items-center gap-8">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="hidden h-3 w-20 md:block" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="hidden h-3 w-24 sm:block" />
            <Skeleton className="hidden h-3 w-28 xl:block" />
          </div>
        </div>

        <div className="divide-y divide-dashboard-border">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex h-16 items-center justify-between gap-8 px-4"
            >
              <Skeleton className="h-4 w-36" />
              <Skeleton className="hidden h-4 w-24 md:block" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="hidden h-4 w-10 sm:block" />
              <Skeleton className="hidden h-4 w-24 xl:block" />
              <Skeleton className="ml-auto size-4" />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-dashboard-border px-4 py-3">
          <Skeleton className="h-4 min-w-0 flex-1 max-w-44" />
          <Skeleton className="h-7.5 w-28 shrink-0 rounded-lg sm:w-40" />
        </div>
      </div>

      <section className="w-full overflow-hidden rounded-xl border border-dashboard-border bg-background shadow-sm">
        <div className="flex items-center gap-2 border-b border-dashboard-border px-4 py-3">
          <Skeleton className="size-4 rounded-sm" />
          <Skeleton className="h-4 w-48" />
        </div>

        <div className="flex flex-col divide-y divide-dashboard-border">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-full max-w-64" />
              </div>

              <Skeleton className="h-8 w-16 shrink-0 rounded-full" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
