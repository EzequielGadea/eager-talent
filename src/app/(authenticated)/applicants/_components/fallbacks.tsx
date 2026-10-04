import { ChevronDown, Loader2, Plus, Search } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { TableCell, TableRow } from "~/components/ui/table";

export function ApplicantsPageSkeleton() {
  return (
    <div className="min-w-0 w-full max-w-full flex-1 overflow-x-hidden p-4 text-dashboard-text-primary">
      <header className="mb-4.5 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold leading-[1.2] tracking-[-0.02em] text-dashboard-dark">
            Candidatos
          </h1>

          <Skeleton className="mt-2 h-4 w-96 max-w-full" />
        </div>

        <Skeleton className="h-8.5 w-36 rounded-full" />
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Skeleton className="h-8.5 w-56 rounded-lg" />
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

export function HeaderFallback({
  isHiringManagerView = false,
}: {
  isHiringManagerView?: boolean;
}) {
  return (
    <header className="mb-4.5 flex items-start justify-between gap-4">
      <div>
        <h1 className="font-heading text-2xl font-bold leading-[1.2] tracking-[-0.02em] text-dashboard-dark">
          Candidatos
        </h1>

        <p className="mt-1 text-sm font-normal leading-normal text-dashboard-text-muted">
          {isHiringManagerView
            ? "Los candidatos de tus vacantes asignadas y los perfiles que un recruiter compartió con vos"
            : "Esperando datos de candidatos..."}
        </p>
      </div>

      {!isHiringManagerView && (
        <div className="flex items-center gap-2">
          <Button
            aria-disabled="true"
            tabIndex={-1}
            size="sm"
            className="pointer-events-none h-8.5 gap-2 rounded-full bg-dashboard-dark px-4 text-[13px] font-semibold leading-none text-white shadow-none hover:bg-dashboard-dark-hover"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Nuevo candidato</span>
          </Button>
        </div>
      )}
    </header>
  );
}

export function TableFallback({
  isHiringManagerView = false,
  showSharedBy = false,
}: {
  isHiringManagerView?: boolean;
  showSharedBy?: boolean;
}) {
  const colSpan = isHiringManagerView ? (showSharedBy ? 4 : 3) : 10;

  return (
    <TableRow className="h-17.5 hover:bg-transparent">
      <TableCell colSpan={colSpan} className="px-4 py-3 text-center">
        <Loader2 className="mx-auto size-5 animate-spin text-dashboard-text-muted" />
      </TableCell>
    </TableRow>
  );
}

export function FiltersFallback({
  isHiringManagerView = false,
}: {
  isHiringManagerView?: boolean;
}) {
  type FilterId =
    "Vacantes" | "Roles" | "Seniority" | "Area" | "Source" | "Etiquetas";

  type FilterConfig = {
    id: FilterId;
    label: string;
  };

  const recruiterFilterConfigs: FilterConfig[] = [
    {
      id: "Vacantes",
      label: "Todas las vacantes",
    },
    {
      id: "Roles",
      label: "Todos los roles",
    },
    {
      id: "Seniority",
      label: "Seniority",
    },
    {
      id: "Area",
      label: "Área",
    },
    {
      id: "Source",
      label: "Fuente",
    },
    {
      id: "Etiquetas",
      label: "Etiquetas",
    },
  ];

  const hiringManagerFilterConfigs: FilterConfig[] = [
    {
      id: "Vacantes",
      label: "Todas las vacantes",
    },
  ];

  const filterConfigs = isHiringManagerView
    ? hiringManagerFilterConfigs
    : recruiterFilterConfigs;

  return (
    <>
      <div className="relative w-56 shrink-0">
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

      {filterConfigs.map((config) => (
        <div
          key={config.id}
          aria-disabled="true"
          className="pointer-events-none flex h-8.5 items-center gap-2 rounded-lg border border-dashboard-border bg-white px-4 text-[13px] font-normal text-dashboard-text-muted shadow-none"
        >
          <span>{config.label}</span>
          <ChevronDown size={14} className="text-dashboard-text-muted" />
        </div>
      ))}
    </>
  );
}
