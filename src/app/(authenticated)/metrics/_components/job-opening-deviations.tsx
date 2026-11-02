"use client";

import { CheckCircle2, CircleAlert } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ListPagination } from "~/components/list-pagination";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
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
  pageSize: number;
  scaleMaximumDays: number;
  highestDeviation: DeviationItem | null;
};

type JobOpeningDeviationsProps = {
  data: DeviationsData;
  isLoading: boolean;
  onPageChange: (page: number) => void;
};

function formatDays(days: number) {
  return `${days} ${Math.abs(days) === 1 ? "día" : "días"}`;
}

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
        <CardTitle>Desvíos por vacante y etapa</CardTitle>
        <p className="text-sm text-muted-foreground">
          Ordenado de mayor a menor desvío
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {!isLoading && highestDeviation ? (
          highestDeviation.deviationDays > 0 ? (
            <div className="flex items-start gap-3 border-l-4 border-danger bg-danger-bg px-4 py-3 text-sm text-tag-red-fg">
              <CircleAlert className="mt-0.5 size-4 shrink-0 text-danger" />
              <p>
                <span className="font-semibold">{highestDeviation.name}</span>{" "}
                es la vacante con mayor desvío total:{" "}
                <span className="font-semibold text-danger">
                  +{highestDeviation.deviationDays} días
                </span>{" "}
                sobre la fecha objetivo de cierre.
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-3 border-l-4 border-success bg-success-bg px-4 py-3 text-sm text-tag-green-fg">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent-green-strong" />
              <p>
                Todas las vacantes cerradas del filtro finalizaron dentro del
                plazo.
              </p>
            </div>
          )
        ) : null}

        <div
          className="flex w-fit items-center gap-1.5 rounded-full bg-surface-dark px-4 py-1.5 text-sm font-medium text-text-on-dark"
          aria-label="Métrica mostrada: tiempo total"
        >
          <span className="size-2 rounded-full bg-danger" aria-hidden="true" />
          Tiempo total
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium uppercase text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="h-4 w-0.5 bg-foreground" /> Objetivo
          </span>
          <span className="flex items-center gap-2">
            <span className="size-2.5 bg-success" /> En plazo
          </span>
          <span className="flex items-center gap-2">
            <span className="size-2.5 bg-danger" /> Atrasado
          </span>
        </div>

        {isLoading ? (
          <DeviationRowsSkeleton />
        ) : data.items.length === 0 ? (
          <div className="flex min-h-36 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            No hay datos para este filtro
          </div>
        ) : (
          <TooltipProvider>
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

                    <Tooltip>
                      <TooltipTrigger
                        type="button"
                        className="relative block h-4 w-full overflow-visible rounded-full bg-surface-sunken outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        aria-label={
                          item.name +
                          ": " +
                          item.durationDays +
                          " días reales, objetivo " +
                          item.targetDurationDays +
                          " días"
                        }
                      >
                        <span
                          className={cn(
                            "block h-full rounded-full",
                            item.isOnTime ? "bg-success" : "bg-danger",
                          )}
                          style={{ width: String(actualWidth) + "%" }}
                        />
                        <span
                          className="absolute top-1/2 h-7 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-foreground"
                          style={{ left: String(targetPosition) + "%" }}
                          aria-hidden="true"
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="flex flex-col gap-1">
                          <p className="font-medium">{item.name}</p>
                          <p>Objetivo: {formatDays(item.targetDurationDays)}</p>
                          <p>Real: {formatDays(item.durationDays)}</p>
                          <p>
                            Desvío: {item.deviationDays > 0 ? "+" : ""}
                            {formatDays(item.deviationDays)}
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>

                    <span
                      className={cn(
                        "text-sm font-semibold md:justify-self-end",
                        item.deviationDays > 0
                          ? "text-danger"
                          : "text-accent-green-strong",
                      )}
                    >
                      {item.deviationDays > 0 ? "+" : ""}
                      {item.deviationDays} días
                    </span>
                  </div>
                );
              })}
            </div>
          </TooltipProvider>
        )}

        {!isLoading ? (
          <ListPagination
            totalItems={data.total}
            pageSize={data.pageSize}
            currentPage={data.page}
            itemLabel="vacantes"
            onPageChange={onPageChange}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
