import { Skeleton } from "~/components/ui/skeleton";
import { TableCell, TableRow } from "~/components/ui/table";

<<<<<<< HEAD
=======
export function ApplicantsPageSkeleton() {
  return (
    <div className="min-w-0 w-full max-w-full flex-1 overflow-x-hidden text-dashboard-text-primary md:p-4">
      <header className="mb-4.5 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-2xl font-bold leading-[1.2] tracking-[-0.02em] text-dashboard-dark">
            Candidatos
          </h1>

          <Skeleton className="mt-2 h-4 w-96 max-w-full" />
        </div>

        <Skeleton className="size-8.5 shrink-0 rounded-full md:w-36" />
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Skeleton className="h-8.5 w-full rounded-lg md:w-56" />
        <Skeleton className="h-8.5 w-36 rounded-lg" />
        <Skeleton className="h-8.5 w-32 rounded-lg" />
      </div>

      <div className="w-full overflow-hidden rounded-xl border border-dashboard-border bg-white shadow-sm">
        <div className="border-b border-dashboard-border px-4 py-3">
          <div className="flex gap-8">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>

        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex h-17.5 items-center gap-8 border-b border-dashboard-border px-4 last:border-b-0"
          >
            <div className="flex w-48 items-center gap-3">
              <Skeleton className="size-9 shrink-0 rounded-full" />

              <div className="space-y-2">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>

            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-28 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

>>>>>>> f353071 (fix: Pagina candidatos responsive)
export function HeaderFallback({
  isHiringManagerView = false,
}: {
  isHiringManagerView?: boolean;
}) {
  return (
    <header className="mb-4.5 flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="font-heading text-2xl font-bold leading-[1.2] tracking-[-0.02em] text-dashboard-dark">
          Candidatos
        </h1>

        <Skeleton className="mt-2 h-4 w-96 max-w-full" />
      </div>

      {!isHiringManagerView && (
<<<<<<< HEAD
        <Skeleton className="h-8.5 w-36 rounded-full" />
=======
        <div className="flex items-center gap-2">
          <Button
            aria-disabled="true"
            tabIndex={-1}
            size="sm"
            className="pointer-events-none h-8.5 w-8.5 gap-2 rounded-full bg-dashboard-dark px-0 text-[13px] font-semibold leading-none text-white shadow-none hover:bg-dashboard-dark-hover md:w-auto md:px-4"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span className="sr-only md:not-sr-only">Nuevo candidato</span>
          </Button>
        </div>
>>>>>>> f353071 (fix: Pagina candidatos responsive)
      )}
    </header>
  );
}

export function FiltersFallback({
  isHiringManagerView = false,
}: {
  isHiringManagerView?: boolean;
}) {
  return (
    <>
      <Skeleton className="h-8.5 w-56 rounded-lg" />
      <Skeleton className="h-8.5 w-36 rounded-lg" />
      {!isHiringManagerView && (
        <>
          <Skeleton className="h-8.5 w-32 rounded-lg" />
          <Skeleton className="h-8.5 w-28 rounded-lg" />
          <Skeleton className="h-8.5 w-24 rounded-lg" />
          <Skeleton className="h-8.5 w-24 rounded-lg" />
          <Skeleton className="h-8.5 w-28 rounded-lg" />
        </>
      )}
    </>
  );
}

export function ApplicantsTableSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={`w-full overflow-hidden rounded-xl border border-dashboard-border bg-white shadow-sm ${className ?? ""}`}
    >
      <div className="border-b border-dashboard-border bg-(--surface-subtle) px-4 py-3">
        <div className="flex gap-8">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>

      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex h-17.5 items-center gap-8 border-b border-dashboard-border px-4 last:border-b-0"
        >
          <div className="flex w-48 items-center gap-3">
            <Skeleton className="size-9 shrink-0 rounded-full" />

            <div className="space-y-2">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>

          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-28 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

export function ApplicantsPageSkeleton() {
  return (
    <div className="min-w-0 w-full max-w-full flex-1 overflow-x-hidden p-4 text-dashboard-text-primary">
      <HeaderFallback />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <FiltersFallback />
      </div>

      <ApplicantsTableSkeleton />
    </div>
  );
}

export function TableFallback({
  isHiringManagerView = false,
  showSharedBy = false,
}: {
  isHiringManagerView?: boolean;
  showSharedBy?: boolean;
}) {
  if (isHiringManagerView) {
    return (
      <>
        {Array.from({ length: 5 }).map((_, index) => (
          <TableRow key={index} className="h-17.5 hover:bg-transparent">
            <TableCell className="px-4 py-3">
              <div className="flex items-center gap-3">
                <Skeleton className="size-9 shrink-0 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </TableCell>
            <TableCell className="px-4 py-3">
              <Skeleton className="h-4 w-32" />
            </TableCell>
            <TableCell className="px-4 py-3">
              <Skeleton className="h-5 w-24 rounded-full" />
            </TableCell>
            {showSharedBy && (
              <TableCell className="px-4 py-3">
                <Skeleton className="h-4 w-24" />
              </TableCell>
            )}
          </TableRow>
        ))}
      </>
    );
  }

  return (
    <>
<<<<<<< HEAD
      {Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index} className="h-17.5 hover:bg-transparent">
          <TableCell className="px-4 py-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-9 shrink-0 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </TableCell>
          <TableCell className="px-4 py-3">
            <Skeleton className="h-5 w-20 rounded-full" />
          </TableCell>
          <TableCell className="px-4 py-3">
            <Skeleton className="h-4 w-28" />
          </TableCell>
          <TableCell className="px-4 py-3">
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell className="px-4 py-3">
            <Skeleton className="h-5 w-16 rounded-full" />
          </TableCell>
          <TableCell className="px-4 py-3">
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell className="px-4 py-3">
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell className="px-4 py-3">
            <Skeleton className="mx-auto size-6 rounded-md" />
          </TableCell>
          <TableCell className="px-4 py-3">
            <Skeleton className="mx-auto size-6 rounded-md" />
          </TableCell>
          <TableCell className="px-4 py-3 pl-10">
            <Skeleton className="h-4 w-36" />
          </TableCell>
        </TableRow>
      ))}
=======
      <div className="relative w-full shrink-0 md:w-56">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dashboard-text-muted"
        />

        <Input
          type="text"
          readOnly
          tabIndex={-1}
          placeholder="Buscar por nombre..."
          className="h-8.5 rounded-lg border-dashboard-border bg-white pl-9 text-[13px] font-normal shadow-none"
        />
      </div>

      <div className="flex w-full gap-2 overflow-x-auto pb-1 md:contents">
        {filterConfigs.map((config) => (
          <div
            key={config.id}
            aria-disabled="true"
            className="pointer-events-none flex h-8.5 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-dashboard-border bg-white px-4 text-[13px] font-normal text-dashboard-text-muted shadow-none"
          >
            <span>{config.label}</span>
            <ChevronDown size={14} className="text-dashboard-text-muted" />
          </div>
        ))}
      </div>
>>>>>>> f353071 (fix: Pagina candidatos responsive)
    </>
  );
}
