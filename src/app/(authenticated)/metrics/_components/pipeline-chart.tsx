"use client";

import { Fragment } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Briefcase } from "lucide-react";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";
import { EmptyChart } from "./disqualification-chart";

type ClosedOpening =
  inferRouterOutputs<AppRouter>["metrics"]["getClosedOpenings"][number];
type Pipeline = inferRouterOutputs<AppRouter>["metrics"]["getPipeline"];
const STAGE_COLORS = [
  "var(--accent-green)",
  "var(--info)",
  "var(--accent-purple)",
  "var(--warning)",
  "var(--text-tertiary)",
];

export function PipelineChart({
  closedOpenings,
  selectedOpeningId,
  pipeline,
}: {
  closedOpenings: ClosedOpening[];
  selectedOpeningId?: string;
  pipeline?: Pipeline;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = selectedOpeningId ?? "";
  const stages = pipeline?.stages ?? [];
  const reachedCounts = stages.map((_, index) =>
    stages.slice(index).reduce((sum, stage) => sum + stage.count, 0),
  );
  const firstReached = reachedCounts[0] ?? 0;
  const lastReached = reachedCounts.at(-1) ?? 0;
  const maxStageCount = Math.max(...reachedCounts, 1);
  const hasConversion = firstReached > 0;
  const globalConversion = hasConversion
    ? (lastReached / firstReached) * 100
    : 0;
  const firstStage = stages[0];
  const lastStage = stages.at(-1);

  return (
    <Card className="gap-0">
      <CardContent>
        <div className="mb-1 flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
          <CardTitle>Pipeline por vacante</CardTitle>
          {closedOpenings.length > 0 && (
            <div className="min-w-0 max-w-full">
              <label htmlFor="metrics-job-opening" className="sr-only">
                Vacante
              </label>
              <Select
                value={selectedId}
                onValueChange={(value) => {
                  if (typeof value === "string") {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("openingId", value);
                    router.push(`?${params.toString()}`);
                  }
                }}
                items={closedOpenings.map((opening) => ({
                  value: opening.id,
                  label: opening.name,
                }))}
              >
                <SelectTrigger
                  id="metrics-job-opening"
                  className="h-auto w-72 min-w-0 max-w-full gap-2 rounded-md bg-card px-3.25 py-1.75 text-small font-medium text-text-primary [&_svg:last-child]:size-3.25 [&_svg:last-child]:text-text-tertiary"
                >
                  <Briefcase className="size-3.5 shrink-0" aria-hidden="true" />
                  <SelectValue placeholder="Seleccioná una vacante" />
                </SelectTrigger>
                <SelectContent
                  alignItemWithTrigger={false}
                  align="end"
                  className="w-max min-w-[var(--anchor-width)] max-w-[calc(100vw-2rem)]"
                >
                  <SelectGroup>
                    {closedOpenings.map((opening) => (
                      <SelectItem key={opening.id} value={opening.id}>
                        {opening.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        {pipeline && firstStage && (
          <p className="mb-5 text-small text-text-secondary">
            Conversión de punta a punta:{" "}
            <strong
              className={
                globalConversion > 0 ? "text-tag-green-fg" : "text-tag-red-fg"
              }
            >
              {hasConversion ? `${Math.round(globalConversion)}%` : "—"}
            </strong>{" "}
            · {firstReached} {firstStage.name.toLowerCase()} → {lastReached}{" "}
            {(lastStage?.name ?? "etapa final").toLowerCase()}
          </p>
        )}
        {closedOpenings.length === 0 ? (
          <EmptyChart message="No hay vacantes cerradas disponibles." />
        ) : !pipeline ? (
          <div
            className="flex min-h-56 flex-col justify-center gap-4"
            role="status"
            aria-label="Cargando pipeline"
          >
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="h-5 w-full" />
            ))}
          </div>
        ) : stages.length === 0 ? (
          <EmptyChart message="La vacante seleccionada no tiene etapas configuradas." />
        ) : (
          <div className="flex flex-col gap-1.5">
            {stages.map((stage, index) => {
              const nextStage = stages[index + 1];
              const reached = reachedCounts[index] ?? 0;
              const reachedNext = reachedCounts[index + 1] ?? 0;
              const advancePercentage =
                nextStage && reached > 0 ? (reachedNext / reached) * 100 : 0;
              const advances = advancePercentage > 0;
              return (
                <Fragment key={stage.id}>
                  <div className="grid grid-cols-[118px_1fr_40px] items-center gap-3.5">
                    <span
                      className="truncate text-small font-medium text-text-primary"
                      title={stage.name}
                    >
                      {stage.name}
                    </span>
                    <span className="relative h-3.5 rounded-full bg-surface-sunken">
                      <span
                        className="absolute left-0 top-0 h-full rounded-full"
                        style={{
                          width: `${(reached / maxStageCount) * 100}%`,
                          backgroundColor:
                            STAGE_COLORS[index % STAGE_COLORS.length],
                        }}
                      />
                    </span>
                    <span className="order-2 text-right text-sm font-bold text-text-primary sm:order-3">
                      {reached}
                    </span>
                  </div>
                  {nextStage && (
                    <div className="grid grid-cols-[118px_1fr_40px]">
                      <span />
                      <span
                        className={`inline-flex items-center gap-1.5 py-px text-label font-semibold ${advances ? "text-tag-green-fg" : "text-tag-red-fg"}`}
                      >
                        <span
                          className={`h-3 w-0.75 rounded-xs ${advances ? "bg-success" : "bg-danger"}`}
                        />
                        {Math.round(advancePercentage)}% avanza
                      </span>
                    </div>
                  )}
                </Fragment>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
