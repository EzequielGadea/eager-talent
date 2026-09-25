import { ChevronDown, Loader2, Plus, Search } from "lucide-react";
import { Button } from "~/components/ui/button";
import { TableCell, TableRow } from "~/components/ui/table";
import { Input } from "~/components/ui/input";

export function HeaderFallback() {
  return (
    <>
      <header className="mb-4.5 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold leading-[1.2] tracking-[-0.02em] text-dashboard-dark">
            Candidatos
          </h1>
          <p className="mt-1 text-sm font-normal leading-normal text-dashboard-text-muted">
            Esperando datos de candidatos...
          </p>
        </div>

        {/* Botones */}
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
      </header>
    </>
  );
}

export function TableFallback() {
  return (
    <TableRow className="h-17.5 hover:bg-transparent">
      <TableCell colSpan={10} className="px-4 py-3 text-center">
        <Loader2 className="mx-auto size-5 animate-spin text-dashboard-text-muted" />
      </TableCell>
    </TableRow>
  );
}

export function FiltersFallback() {
  type FilterId =
    "Vacantes" | "Roles" | "Seniority" | "Area" | "Source" | "Etiquetas";

  type FilterConfig = {
    id: FilterId;
    label: string;
  };

  const filterConfigs: FilterConfig[] = [
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

      {filterConfigs.map((config) => {
        return (
          <div
            key={config.id}
            aria-disabled="true"
            className="pointer-events-none flex h-8.5 items-center gap-2 rounded-lg border border-dashboard-border bg-white px-4 text-[13px] font-normal text-dashboard-text-muted shadow-none"
          >
            <span>{config.label}</span>
            <ChevronDown size={14} className="text-dashboard-text-muted" />
          </div>
        );
      })}
    </>
  );
}
