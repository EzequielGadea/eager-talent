import { ChevronDown, Filter, Plus } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export function RecruiterJobOpeningsFallback() {
  return (
    <div aria-busy="true" className="mx-auto flex w-full flex-col gap-5 p-6">
      <span className="sr-only">Cargando vacantes</span>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Vacantes</h1>

          <div className="mt-2 flex items-center gap-2">
            <Skeleton className="h-4 w-64" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled
            className="h-8 px-4 text-[13px] font-normal text-text-secondary"
          >
            <Filter data-icon="inline-start" />
            Filtrar
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled
            className="h-8 px-4 text-[13px] font-normal text-text-secondary"
          >
            Ordenar
            <ChevronDown data-icon="inline-end" />
          </Button>

          <Button
            size="sm"
            disabled
            className="rounded-full bg-dashboard-dark text-text-on-dark"
          >
            <Plus data-icon="inline-start" />
            Nueva vacante
          </Button>
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-xl border border-dashboard-border bg-background shadow-sm">
        <div className="w-full overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow className="border-b border-dashboard-border bg-(--surface-subtle) hover:bg-(--surface-subtle)">
                <TableHead className="px-4 py-3">Vacante</TableHead>
                <TableHead className="px-4 py-3">Área</TableHead>
                <TableHead className="px-4 py-3">Hiring Managers</TableHead>
                <TableHead className="px-4 py-3">Estado</TableHead>
                <TableHead className="px-4 py-3">Candidatos</TableHead>
                <TableHead className="px-4 py-3">Abierta hace</TableHead>
                <TableHead className="px-4 py-3" />
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-dashboard-border">
              {Array.from({ length: 8 }).map((_, index) => (
                <TableRow key={index} className="h-17.5 hover:bg-transparent">
                  <TableCell className="px-4 py-3">
                    <Skeleton className="h-4 w-36" />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Skeleton className="ml-auto size-4" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between border-t border-dashboard-border px-4 py-3">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-7.5 w-40 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
