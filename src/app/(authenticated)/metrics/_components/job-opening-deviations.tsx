"use client";

import { CheckCircle2, CircleAlert } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";

type DeviationItem = {
  id: string;
  name: string;
  durationDays: number;
  targetDurationDays: number;
  deviationDays: number;
  isOnTime: boolean;
};

type DeviationsData = {
  items: DeviationItem[];
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
  scaleMaximumDays: number;
  highestDeviation: DeviationItem | null;
};

type JobOpeningDeviationsProps = {
  data: DeviationsData;
  isLoading: boolean;
  onPageChange: (page: number) => void;
};

function DeviationRowsSkeleton() {
  return (
    <div className="space-y-5" aria-label="Cargando desvíos">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="grid gap-2 md:grid-cols-[220px_1fr_80px] md:items-center"
        >
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-4 w-full rounded-full" />
          <Skeleton className="h-5 w-16 md:justify-self-end" />
        </div>
      ))}
    </div>
  );
}

export function JobOpeningDeviations({
  data,
  isLoading,
  onPageChange,
}: JobOpeningDeviationsProps) {
  const highestDeviation = data.highestDeviation;

  return (
    <Card>
      <CardHeader className="gap-1">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Desvíos por vacante y etapa
        </CardTitle>
        <p className="text-base text-muted-foreground">
          Ordenado de mayor a menor desvío
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {!isLoading && highestDeviation ? (
          highestDeviation.deviationDays > 0 ? (
            <div className="flex items-start gap-3 border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-950">
              <CircleAlert className="mt-0.5 size-4 shrink-0 text-red-500" />
              <p>
                <span className="font-semibold">{highestDeviation.name}</span>{" "}
                es la vacante con mayor desvío total:{" "}
                <span className="font-semibold text-red-500">
                  +{highestDeviation.deviationDays} días
                </span>{" "}
                sobre la fecha objetivo de cierre.
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-3 border-l-4 border-emerald-500 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              <p>
                Todas las vacantes cerradas del filtro finalizaron dentro del
                plazo.
              </p>
            </div>
          )
        ) : null}

        <div
          className="flex w-fit items-center gap-1.5 rounded-full bg-slate-900 px-4 py-1.5 text-sm font-medium text-white"
          aria-label="Métrica mostrada: tiempo total"
        >
          <span className="size-2 rounded-full bg-red-500" aria-hidden="true" />
          Tiempo total
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium uppercase text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="h-4 w-0.5 bg-foreground" /> Objetivo
          </span>
          <span className="flex items-center gap-2">
            <span className="size-2.5 bg-emerald-500" /> En plazo
          </span>
          <span className="flex items-center gap-2">
            <span className="size-2.5 bg-red-500" /> Atrasado
          </span>
        </div>

        {isLoading ? (
          <DeviationRowsSkeleton />
        ) : data.items.length === 0 ? (
          <div className="flex min-h-36 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            No hay datos para este filtro
          </div>
        ) : (
          <div className="space-y-5">
            {data.items.map((item, index) => {
              const actualWidth = Math.max(
                (item.durationDays / data.scaleMaximumDays) * 100,
                1,
              );
              const targetPosition = Math.min(
                (item.targetDurationDays / data.scaleMaximumDays) * 100,
                100,
              );

              return (
                <div
                  key={item.id}
                  className="grid gap-2 md:grid-cols-[220px_1fr_80px] md:items-center"
                >
                  <div
                    className="truncate text-sm font-semibold"
                    title={item.name}
                  >
                    <span className="mr-2 text-muted-foreground">
                      {(data.page - 1) * data.pageSize + index + 1}
                    </span>
                    {item.name}
                  </div>

                  <div
                    className="relative h-4 overflow-visible rounded-full bg-slate-100"
                    aria-label={
                      item.name +
                      ": " +
                      item.durationDays +
                      " días reales, objetivo " +
                      item.targetDurationDays +
                      " días"
                    }
                  >
                    <div
                      className={cn(
                        "h-full rounded-full",
                        item.isOnTime ? "bg-emerald-500" : "bg-red-500",
                      )}
                      style={{ width: String(actualWidth) + "%" }}
                    />
                    <span
                      className="absolute top-1/2 h-7 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-foreground"
                      style={{ left: String(targetPosition) + "%" }}
                      aria-hidden="true"
                    />
                  </div>

                  <span
                    className={cn(
                      "text-sm font-semibold md:justify-self-end",
                      item.deviationDays > 0
                        ? "text-red-500"
                        : "text-emerald-600",
                    )}
                  >
                    {item.deviationDays > 0 ? "+" : ""}
                    {item.deviationDays} días
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {!isLoading && data.pageCount > 1 ? (
          <Pagination aria-label="Paginación de desvíos">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  text="Anterior"
                  aria-label="Ir a la página anterior"
                  href="#"
                  aria-disabled={data.page === 1}
                  tabIndex={data.page === 1 ? -1 : undefined}
                  className={cn(
                    data.page === 1 && "pointer-events-none opacity-50",
                  )}
                  onClick={(event) => {
                    event.preventDefault();
                    if (data.page > 1) {
                      onPageChange(data.page - 1);
                    }
                  }}
                />
              </PaginationItem>

              {Array.from({ length: data.pageCount }).map((_, index) => {
                const page = index + 1;
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={page === data.page}
                      onClick={(event) => {
                        event.preventDefault();
                        onPageChange(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  text="Siguiente"
                  aria-label="Ir a la página siguiente"
                  href="#"
                  aria-disabled={data.page === data.pageCount}
                  tabIndex={data.page === data.pageCount ? -1 : undefined}
                  className={cn(
                    data.page === data.pageCount &&
                      "pointer-events-none opacity-50",
                  )}
                  onClick={(event) => {
                    event.preventDefault();
                    if (data.page < data.pageCount) {
                      onPageChange(data.page + 1);
                    }
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        ) : null}
      </CardContent>
    </Card>
  );
}
