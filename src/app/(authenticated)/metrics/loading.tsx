import { Skeleton } from "~/components/ui/skeleton";

export default function MetricsLoading() {
  return (
    <section
      className="flex flex-col gap-6"
      role="status"
      aria-label="Cargando métricas"
    >
      <span className="sr-only">Cargando métricas</span>

      <header className="flex items-center justify-between gap-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-36" />
      </header>

      <div className="flex flex-wrap gap-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-48" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="flex min-h-40 flex-col justify-center gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
          >
            <Skeleton className="size-5 rounded-full" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>

      <div className="space-y-5 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <Skeleton className="h-5 w-56" />
        <Skeleton className="h-4 w-72" />
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="grid gap-2 md:grid-cols-[220px_1fr_80px] md:items-center"
          >
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-full rounded-full" />
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {[0, 1].map((index) => (
          <div
            key={index}
            className="flex min-h-[25rem] flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
          >
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        ))}
      </div>

      <div className="min-h-72 space-y-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <Skeleton className="h-6 w-56" />
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-5 w-full" />
        ))}
      </div>
    </section>
  );
}
