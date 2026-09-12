
import {
    Download,
    Plus,
    Loader2
} from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import {
  Search,
  ChevronDown,
} from "lucide-react";

import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext
} from "~/components/ui/pagination";

export function HeaderFallback() {
    return (
    <>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-dashboard-dark">
            Candidatos
          </h1>
          <p className="mt-0.5 text-base font-medium text-dashboard-text-muted">
            Esperando datos de candidatos...
          </p>
        </div>

        {/* Botones */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 rounded-full border-dashboard-border bg-white px-5 py-5 text-sm font-medium text-dashboard-text-muted shadow-xs hover:bg-dashboard-track hover:text-dashboard-text-muted"
          >
            <Download size={16} className="text-dashboard-text-muted" />
            <span>Exportar</span>
          </Button>

          <Button
            size="sm"
            //onClick={() => redirect("/candidatos/alta")} TODO no usable onclick por ser server, mostrar bloqueado de alguna forma, lo mismo con export
            className="h-9 gap-1.5 rounded-full bg-dashboard-dark px-5 py-5 text-sm font-medium text-white shadow-xs hover:bg-dashboard-dark-hover"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Añadir</span>
          </Button>
        </div>
      </header>
    </>
    )
}

export function TableFallback() {
    return (
        <div className="w-full overflow-x-auto rounded-xl border border-dashboard-border bg-white shadow-sm">
          <Table className="min-w-262.5 table-fixed">
          <TableHeader>
            <TableRow className="border-b border-dashboard-border hover:bg-transparent">
              <TableHead className="w-30 h-10 px-3 py-4 pl-5 text-sm font-bold uppercase tracking-[0.06em] text-dashboard-text-light text-center">
                Candidato
              </TableHead>
              <TableHead className="w-20 h-10 px-3 py-4 text-sm font-bold uppercase tracking-[0.06em] text-dashboard-text-light text-center">
                Etiquetas
              </TableHead>
              <TableHead className="w-30 h-10 px-3 py-4 text-sm font-bold uppercase tracking-[0.06em] text-dashboard-text-light text-center">
                Vacante
              </TableHead>
              <TableHead className="w-20 h-10 px-3 py-4 text-sm font-bold uppercase tracking-[0.06em] text-dashboard-text-light text-center">
                Rol
              </TableHead>
              <TableHead className="w-15 h-10 px-3 py-4 text-sm font-bold uppercase tracking-[0.06em] text-dashboard-text-light text-center">
                Seniority
              </TableHead>
              <TableHead className="w-20 h-10 px-3 py-4 text-sm font-bold uppercase tracking-[0.06em] text-dashboard-text-light text-center">
                Área
              </TableHead>
              <TableHead className="w-20 h-10 px-3 py-4 text-sm font-bold uppercase tracking-[0.06em] text-dashboard-text-light text-center">
                Source
              </TableHead>
              <TableHead className="w-7 h-10 px-3 py-4 text-center text-sm font-bold uppercase tracking-[0.06em] text-dashboard-text-light text-center">
                CV
              </TableHead>
              <TableHead className="w-15 h-10 px-3 py-4 text-center text-sm font-bold uppercase tracking-[0.06em] text-dashboard-text-light text-center">
                LinkedIn
              </TableHead>
              <TableHead className="w-30 h-10 px-3 py-4 pr-5 text-sm font-bold uppercase tracking-[0.06em] text-dashboard-text-light text-center">
                Correo
              </TableHead>
            </TableRow>
          </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="px-5 py-4 pl-5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold`}
                    >
                      
                    </div>
                    <span className="max-w-36 truncate text-sm font-bold text-dashboard-dark whitespace-normal break-words text-center">
                      
                    </span>
                  </div>
                </TableCell>

                <TableCell className="px-3 py-4">
                  <div className="flex flex-wrap items-center gap-1.5">

                  </div>
                </TableCell>

                {/* Vacante */}
                <TableCell className="px-3 py-4">
                  <div
                    className="max-w-44 truncate text-sm font-semibold text-dashboard-text-muted"
                    title="BBBBBBBBBBBBBB"
                  >
                    
                  </div>
                </TableCell>

                {/* Rol */}
                <TableCell className="px-3 py-4 text-sm font-medium text-dashboard-text-muted">
                  
                </TableCell>

                {/* Seniority */}
                <TableCell className="px-3 py-4">
                  <Loader2 className="animate-spin origin-[center]"/>
                </TableCell>

                {/* Área */}
                <TableCell className="px-3 py-4 text-sm font-medium text-dashboard-text-muted">
                  
                </TableCell>

                {/* Source */}
                <TableCell className="px-3 py-4">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-dashboard-text-muted">
                    <span className="shrink-0"></span>
                    <span className="truncate"></span>
                  </div>
                </TableCell>

                {/* CV */}
                <TableCell className="px-3 py-4 text-center">

                </TableCell>

                {/* LinkedIn */}
                <TableCell className="px-3 py-4 text-center">

                </TableCell>

                {/* Email */}
                <TableCell className="px-3 py-4 pr-5">
                  <div
                    className="max-w-48 truncate text-sm font-medium text-dashboard-text-muted"
                    title="AAAAAAAAAAAAAAAAA"
                  >
                    {}
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
    )
}

export function FiltersFallback() {

  type FilterId =
  | "Vacantes"
  | "Roles"
  | "Seniority"
  | "Area"
  | "Source"
  | "Etiquetas";

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


  const selections : Record<FilterId, string[]>= ({
    Vacantes: [],
    Roles: [],
    Seniority: [],
    Area: [],
    Source: [],
    Etiquetas: [],
  });

  const handleSelectionToggle = (filterId: string, option: string) => {};  
  return (
      <>
        <div className="relative w-56 shrink-0">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dashboard-text-muted"
          />
          <Input
            type="text"
            placeholder="Buscar por nombre..."
            className="h-8 rounded-lg border-dashboard-border bg-white pl-9 text-sm shadow-sm"
          />
        </div>
        
        {filterConfigs.map((config) => {
          const count = selections[config.id]?.length || 0;
          const buttonText =
            count > 0 ? `${config.id} · ${count}` : config.label;
        
          return (
            <Popover key={config.id}>
              <PopoverTrigger className="flex h-8 items-center gap-1.5 rounded-lg border border-dashboard-border bg-white px-4 text-sm font-medium text-dashboard-text-muted shadow-sm transition-colors hover:bg-dashboard-success-light hover:text-dashboard-success-text">
                <span>{buttonText}</span>
                <ChevronDown size={14} className="text-dashboard-text-muted" />
              </PopoverTrigger>

              <PopoverContent align="start" className="w-56 rounded-xl p-3">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-dashboard-text-light">
                  Filtrar por {config.id.toLowerCase()}
                </p>

                <Input
                  type="text"
                  placeholder={`Buscar ${config.id.toLowerCase()}...`}
                  className="mb-3 h-8 rounded-md border-dashboard-border bg-dashboard-track/40 text-sm"
                />

                <Button
                  variant="ghost"
                  size="sm"
                  //onClick={() => clearSelection(config.id)}
                  className="h-auto p-0 text-xs font-bold text-dashboard-text-muted hover:bg-transparent hover:text-dashboard-success-text"
                >
                  Limpiar
                </Button>
              </PopoverContent>
            </Popover>
          );
        })}
      </>
    )
}

export function PaginationFallback() {
    return (
        <div className="mt-4 flex items-center justify-between pb-6">
        <p className="text-sm font-medium text-dashboard-text-muted">
          Esperando candidatos...
        </p>

        <Pagination className="mx-0 w-auto">
          <PaginationContent className="gap-1">
            <PaginationItem>
              <PaginationPrevious
                href="#"
                className="h-7 w-7 rounded-md p-0 text-dashboard-text-muted hover:bg-dashboard-track [&>span]:hidden"
              />
            </PaginationItem>

            <PaginationItem>
              <PaginationLink
                href="#"
                isActive
                className="h-7 w-7 rounded-md bg-dashboard-dark text-sm font-bold text-white shadow-sm hover:bg-dashboard-dark-hover hover:text-white"
              >
                1
              </PaginationLink>
            </PaginationItem>
             <PaginationItem>
              <PaginationNext
                href="#"
                className="h-7 w-7 rounded-md p-0 text-dashboard-text-muted hover:bg-dashboard-track [&>span]:hidden"
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      )
}