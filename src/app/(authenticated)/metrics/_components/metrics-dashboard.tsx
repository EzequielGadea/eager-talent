"use client";

import { useEffect, useState, Fragment } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { ChartContainer } from "~/components/ui/chart";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "~/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "~/components/ui/select";
import { Briefcase } from "lucide-react";
import { api } from "~/lib/trpc/react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type MetricsSummary = RouterOutputs["metrics"]["getMetricsSummary"];
type ClosedOpening = RouterOutputs["metrics"]["getClosedOpenings"][number];

function formatPercentage(value: number | null) {
  return value === null ? "—" : `${Math.round(value)} %`;
}

function EmptyChart({ message }: { message: string }) {
  return (
    <Empty className="min-h-56 border-0">
      <EmptyHeader>
        <EmptyTitle>No hay datos para mostrar</EmptyTitle>
        <EmptyDescription>{message}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

// Mismos colores que el mockup (emerald-500, violet-500, blue-600, amber-500, slate-400)
const MOTIVE_COLORS = ["#10b981", "#8b5cf6", "#2563eb", "#f59e0b", "#94a3b8"];

function TruncatedTick({
  x = 0,
  y = 0,
  payload,
}: {
  x?: number;
  y?: number;
  payload?: { value: string };
}) {
  return (
    <foreignObject x={x - 35} y={y + 2} width={70} height={20}>
      <div
        title={payload?.value}
        className="truncate text-center text-[11px] text-text-tertiary"
      >
        {payload?.value}
      </div>
    </foreignObject>
  );
}

function DisqualificationChart({
  motives,
}: {
  motives: MetricsSummary["disqualificationMotives"];
}) {
  // Eje Y dinámico: múltiplo de 10 hacia arriba (35% -> 40), mínimo 10
  const maxValue = Math.max(
    10,
    Math.ceil(Math.max(...motives.map((m) => m.percentage), 0) / 10) * 10,
  );
  const ticks = Array.from({ length: maxValue / 10 + 1 }, (_, i) => i * 10);

  return (
    <Card className="h-full gap-0">
      <CardContent className="flex flex-1 flex-col">
        <CardTitle className="text-base font-bold tracking-[-0.01em]">
          Motivos de descalificación
        </CardTitle>

        {motives.length === 0 ? (
          <div className="mt-4">
            <EmptyChart message="Todavía no hay postulaciones descalificadas con un motivo registrado." />
          </div>
        ) : (
          <>
            {/* Leyenda */}
            <div className="mb-4 mt-3 flex flex-wrap gap-x-4 gap-y-2.5">
              {motives.map((motive, index) => (
                <span
                  key={motive.name}
                  className="inline-flex items-center gap-[5px] text-xs text-text-secondary"
                >
                  <span
                    className="size-[9px] rounded-[2px]"
                    style={{
                      background: MOTIVE_COLORS[index % MOTIVE_COLORS.length],
                    }}
                  />
                  {motive.name}
                  <strong className="font-bold text-text-primary">
                    {formatPercentage(motive.percentage)}
                  </strong>
                </span>
              ))}
            </div>

            {/* Gráfico */}
            <ChartContainer
              className="mb-1.5 h-[168px] w-full"
              label="Porcentaje de postulaciones por motivo de descalificación"
            >
              <BarChart
                data={motives}
                margin={{ top: 0, right: 4, bottom: 0, left: 0 }}
                barCategoryGap={10}
              >
                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  interval={0}
                  axisLine={false}
                  tickLine={false}
                  height={28}
                  tick={<TruncatedTick />}
                />
                <YAxis
                  type="number"
                  domain={[0, maxValue]}
                  ticks={ticks}
                  width={46}
                  tickMargin={16}
                  tickFormatter={(value: number) => `${value}%`}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
                />
                <Tooltip
                  cursor={false}
                  formatter={(value) => [
                    `${Number(value).toFixed(1)} %`,
                    "Porcentaje",
                  ]}
                />
                <Bar dataKey="percentage" radius={[6, 6, 0, 0]} maxBarSize={58}>
                  {motives.map((motive, index) => (
                    <Cell
                      key={motive.name}
                      fill={MOTIVE_COLORS[index % MOTIVE_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>

            {/* Tabla */}
            <div className="mt-2 flex flex-1 flex-col">
              <div className="flex items-center justify-between px-0.5 py-1.5 text-[11px] font-bold tracking-[0.06em] text-text-tertiary">
                <span>MOTIVO</span>
                <span>%</span>
              </div>
              <div className="flex flex-1 flex-col">
                {motives.map((motive) => (
                  <div
                    key={motive.name}
                    className="flex min-h-[43px] flex-1 items-center justify-between gap-3 border-t border-slate-100 px-0.5 text-[13px] text-text-primary"
                  >
                    <span className="min-w-0 truncate" title={motive.name}>
                      {motive.name}
                    </span>
                    <span className="shrink-0 font-semibold">
                      {formatPercentage(motive.percentage)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function SourcesChart({
  sources,
}: {
  sources: MetricsSummary["applicationSources"];
}) {
  return (
    <Card className="h-full gap-0">
      <CardContent className="flex flex-1 flex-col">
        <CardTitle className="mb-1.5 text-base font-bold tracking-[-0.01em]">
          Fuentes de postulación
        </CardTitle>

        {sources.length === 0 ? (
          <div className="mt-4">
            <EmptyChart message="Todavía no hay postulaciones asociadas a vacantes cerradas." />
          </div>
        ) : (
          <>
            {/* Donut: absorbe el alto sobrante de la card */}
            <div className="flex flex-1 items-center justify-center pb-[22px] pt-4">
              <ChartContainer
                className="size-56 shrink-0"
                label="Distribución de postulaciones por fuente"
              >
                <PieChart>
                  <Tooltip
                    formatter={(value) => [`${Number(value)} postulaciones`]}
                  />
                  <Pie
                    data={sources}
                    dataKey="count"
                    nameKey="name"
                    innerRadius="47.6%"
                    outerRadius="100%"
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={0}
                    stroke="none"
                  >
                    {sources.map((source, index) => (
                      <Cell
                        key={source.name}
                        fill={MOTIVE_COLORS[index % MOTIVE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>

            {/* Tabla */}
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="px-0.5 py-1.5 text-left text-[11px] font-bold tracking-[0.06em] text-text-tertiary">
                    FUENTE
                  </th>
                  <th className="px-0.5 py-1.5 text-right text-[11px] font-bold tracking-[0.06em] text-text-tertiary">
                    %
                  </th>
                </tr>
              </thead>
              <tbody>
                {sources.map((source, index) => (
                  <tr key={source.name} className="border-t border-slate-100">
                    <td className="px-0.5 py-[11px] text-[13px] text-text-primary">
                      <span className="flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className="size-2 shrink-0 rounded-[2px]"
                          style={{
                            backgroundColor:
                              MOTIVE_COLORS[index % MOTIVE_COLORS.length],
                          }}
                        />
                        <span className="min-w-0 truncate" title={source.name}>
                          {source.name}
                        </span>
                      </span>
                    </td>
                    <td className="px-0.5 py-[11px] text-right text-[13px] font-semibold text-text-primary">
                      {Math.round(source.percentage)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Colores por etapa, en el orden del mockup (emerald, blue, violet, amber) + slate de reserva
const STAGE_COLORS = ["#10b981", "#2563eb", "#8b5cf6", "#f59e0b", "#94a3b8"];

function PipelineChart({
  closedOpenings,
}: {
  closedOpenings: ClosedOpening[];
}) {
  const firstOpeningId = closedOpenings[0]?.id ?? "";
  const [selectedOpeningId, setSelectedOpeningId] = useState(firstOpeningId);

  useEffect(() => {
    if (closedOpenings.length === 0) {
      setSelectedOpeningId("");
      return;
    }

    if (!closedOpenings.some((opening) => opening.id === selectedOpeningId)) {
      setSelectedOpeningId(firstOpeningId);
    }
  }, [closedOpenings, firstOpeningId, selectedOpeningId]);

  const pipelineQuery = api.metrics.getPipeline.useQuery(
    { jobOpeningId: selectedOpeningId },
    { enabled: selectedOpeningId.length > 0 },
  );
  const pipeline =
    pipelineQuery.data?.jobOpeningId === selectedOpeningId
      ? pipelineQuery.data
      : undefined;
  const firstStage = pipeline?.stages[0];
  const lastStage = pipeline?.stages.at(-1);
  const stages = pipeline?.stages ?? [];
  // reachedCounts[i] = cuántos llegaron al menos hasta la etapa i
  const reachedCounts = stages.map((_, i) =>
    stages.slice(i).reduce((sum, s) => sum + s.count, 0),
  );
  const firstReached = reachedCounts[0] ?? 0;
  const lastReached = reachedCounts.at(-1) ?? 0;
  const maxStageCount = Math.max(...reachedCounts, 1);
  const hasConversion = firstReached > 0;
  const globalConversion = hasConversion
    ? (lastReached / firstReached) * 100
    : 0;

  return (
    <Card className="gap-0">
      <CardContent>
        {/* Header */}
        <div className="mb-1 flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
          <CardTitle className="text-base font-bold tracking-[-0.01em]">
            Pipeline por vacante
          </CardTitle>
          {closedOpenings.length > 0 && (
            <div className="min-w-0 max-w-full">
              <label htmlFor="metrics-job-opening" className="sr-only">
                Vacante
              </label>
              <Select
                value={selectedOpeningId}
                onValueChange={(value) => {
                  if (typeof value === "string") setSelectedOpeningId(value);
                }}
                items={closedOpenings.map((o) => ({
                  value: o.id,
                  label: o.name,
                }))}
              >
                <SelectTrigger
                  id="metrics-job-opening"
                  className="h-auto w-auto min-w-0 max-w-full gap-2 rounded-md bg-card px-3.25 py-1.75 text-[13px] font-medium text-text-primary [&_svg:last-child]:size-3.25 [&_svg:last-child]:text-text-tertiary"
                >
                  <Briefcase className="size-3.5 shrink-0" aria-hidden="true" />
                  <SelectValue placeholder="Seleccioná una vacante" />
                </SelectTrigger>
                <SelectContent>
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

        {/* Subtítulo */}
        {pipeline && firstStage && (
          <p className="mb-5 text-[13px] text-text-secondary">
            Conversión de punta a punta:{" "}
            <strong
              className={
                globalConversion > 0 ? "text-emerald-700" : "text-red-600"
              }
            >
              {hasConversion ? `${Math.round(globalConversion)}%` : "—"}
            </strong>{" "}
            · {firstReached} {firstStage.name.toLowerCase()} → {lastReached}{" "}
            {(lastStage?.name ?? "etapa final").toLowerCase()}
          </p>
        )}

        {/* Contenido */}
        {closedOpenings.length === 0 ? (
          <EmptyChart message="No hay vacantes cerradas disponibles." />
        ) : pipelineQuery.isError ? (
          <div className="flex min-h-56 flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-text-secondary">
              No se pudo cargar el pipeline.
            </p>
            <button
              type="button"
              className="text-sm font-medium text-text-link underline underline-offset-4"
              onClick={() => void pipelineQuery.refetch()}
            >
              Intentar nuevamente
            </button>
          </div>
        ) : pipelineQuery.isPending || !pipeline ? (
          <div
            className="flex min-h-56 items-center justify-center text-sm text-text-secondary"
            role="status"
          >
            Cargando pipeline…
          </div>
        ) : pipeline.stages.length === 0 ? (
          <EmptyChart message="La vacante seleccionada no tiene etapas configuradas." />
        ) : (
          <div className="flex flex-col gap-1.5">
            {pipeline.stages.map((stage, index) => {
              const nextStage = pipeline.stages[index + 1];
              const color = STAGE_COLORS[index % STAGE_COLORS.length];

              const reached = reachedCounts[index] ?? 0;
              const reachedNext = reachedCounts[index + 1] ?? 0;
              const barWidth = (reached / maxStageCount) * 100;
              const advancePercentage =
                nextStage && reached > 0 ? (reachedNext / reached) * 100 : 0;
              const advances = advancePercentage > 0;

              return (
                <Fragment key={stage.id}>
                  <div className="grid grid-cols-[118px_1fr_40px] items-center gap-3.5">
                    <span
                      className="truncate text-[13px] font-medium text-text-primary"
                      title={stage.name}
                    >
                      {stage.name}
                    </span>
                    <span className="relative h-3.5 rounded-full bg-slate-100">
                      <span
                        className="absolute left-0 top-0 h-full rounded-full"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: color,
                        }}
                      />
                    </span>
                    <span className="order-2 text-right text-[15px] font-bold text-text-primary sm:order-3">
                      {reached}
                    </span>
                  </div>

                  {nextStage && (
                    <div className="grid grid-cols-[118px_1fr_40px]">
                      <span />
                      <span
                        className={`inline-flex items-center gap-1.5 py-px text-[11px] font-semibold ${
                          advances ? "text-emerald-700" : "text-red-600"
                        }`}
                      >
                        <span
                          className={`h-3 w-0.75 rounded-xs ${
                            advances ? "bg-emerald-500" : "bg-red-500"
                          }`}
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

export function MetricsDashboard({
  summary,
  closedOpenings,
}: {
  summary: MetricsSummary;
  closedOpenings: ClosedOpening[];
}) {
  return (
    <section className="flex flex-col gap-5">
      <header>
        <h1 className="font-heading text-2xl font-semibold text-text-primary">
          Métricas
        </h1>
      </header>

      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
        <DisqualificationChart
          motives={summary.disqualificationMotives}
          total={summary.totalDisqualified}
        />
        <SourcesChart
          sources={summary.applicationSources}
          total={summary.totalApplications}
        />
      </div>

      <PipelineChart closedOpenings={closedOpenings} />
    </section>
  );
}
