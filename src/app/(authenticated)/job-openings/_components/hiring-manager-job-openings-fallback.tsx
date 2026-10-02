import { CalendarDays } from "lucide-react";

import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export function HiringManagerJobOpeningsFallback() {
  return (
    <div aria-busy="true" className="mx-auto flex w-full flex-col gap-5 p-6">
      <span className="sr-only">Cargando tus vacantes</span>

      <div>
        <h1 className="text-2xl font-bold text-text-primary">Mis vacantes</h1>

        <div className="mt-2 flex items-center gap-2">
          <Skeleton className="h-4 w-full max-w-64" />
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-xl border border-dashboard-border bg-background shadow-sm">
        <div className="w-full overflow-hidden">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="border-b border-dashboard-border bg-(--surface-subtle) hover:bg-(--surface-subtle)">
                <TableHead className="px-4 py-3">Vacante</TableHead>
                <TableHead className="hidden px-4 py-3 md:table-cell">
                  Área
                </TableHead>
                <TableHead className="px-4 py-3">Estado</TableHead>
                <TableHead className="hidden px-4 py-3 sm:table-cell">
                  Candidatos
                </TableHead>
                <TableHead className="hidden px-4 py-3 xl:table-cell">
                  Entrevista técnica
                </TableHead>
                <TableHead className="hidden px-4 py-3 xl:table-cell">
                  Ofertados
                </TableHead>
                <TableHead className="hidden px-4 py-3 xl:table-cell">
                  Abierta hace
                </TableHead>
                <TableHead className="w-12 px-4 py-3" />
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-dashboard-border">
              {Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index} className="h-17.5 hover:bg-transparent">
                  <TableCell className="px-4 py-3">
                    <Skeleton className="h-4 w-full max-w-36" />
                  </TableCell>
                  <TableCell className="hidden px-4 py-3 md:table-cell">
                    <Skeleton className="h-4 w-full max-w-24" />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Skeleton className="h-6 w-full max-w-20 rounded-full" />
                  </TableCell>
                  <TableCell className="hidden px-4 py-3 sm:table-cell">
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                  <TableCell className="hidden px-4 py-3 xl:table-cell">
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                  <TableCell className="hidden px-4 py-3 xl:table-cell">
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                  <TableCell className="hidden px-4 py-3 xl:table-cell">
                    <Skeleton className="h-4 w-full max-w-24" />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Skeleton className="ml-auto size-4" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-dashboard-border px-4 py-3">
          <Skeleton className="h-4 min-w-0 flex-1 max-w-44" />
          <Skeleton className="h-7.5 w-28 shrink-0 rounded-lg sm:w-40" />
        </div>
      </div>

      <section className="w-full overflow-hidden rounded-xl border border-dashboard-border bg-background shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-dashboard-border px-4 py-3">
          <CalendarDays className="size-4 text-dashboard-text-muted" />
          <h2 className="text-sm font-semibold text-text-primary">
            Entrevistas asignadas a vos
          </h2>
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
