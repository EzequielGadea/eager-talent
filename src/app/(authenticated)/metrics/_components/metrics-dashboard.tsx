"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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
import { api } from "~/lib/trpc/react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";

const chartColors = [
  "var(--accent-green-strong)",
  "var(--accent-purple-strong)",
  "var(--info)",
  "var(--warning)",
  "var(--danger)",
  "var(--dashboard-sky-text)",
  "var(--dashboard-orange-text)",
  "var(--dashboard-purple-text)",
];

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
  total,
}: {
  sources: MetricsSummary["applicationSources"];
  total: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fuentes de postulación</CardTitle>
        <CardDescription>
          Distribución de {total} postulaciones en vacantes cerradas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {sources.length === 0 ? (
          <EmptyChart message="Todavía no hay postulaciones asociadas a vacantes cerradas." />
        ) : (
          <>
            <ChartContainer
              className="h-64 w-full"
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
                  innerRadius="56%"
                  outerRadius="82%"
                  paddingAngle={2}
                  strokeWidth={2}
                  stroke="var(--card)"
                >
                  {sources.map((source, index) => (
                    <Cell
                      key={source.name}
                      fill={chartColors[index % chartColors.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>

            <div className="overflow-hidden rounded-md border border-border-default">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 bg-surface-subtle px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                <span>FUENTE</span>
                <span className="text-right">%</span>
              </div>
              <div className="divide-y divide-border-default bg-card">
                {sources.map((source, index) => (
                  <div
                    key={source.name}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5 text-sm"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            chartColors[index % chartColors.length],
                        }}
                        aria-hidden="true"
                      />
                      <span
                        className="min-w-0 truncate text-text-secondary"
                        title={source.name}
                      >
                        {source.name}
                      </span>
                    </span>
                    <span className="shrink-0 font-medium text-text-primary">
                      {formatPercentage(source.percentage)}
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
  const globalConversionText =
    pipeline && firstStage
      ? firstStage.count > 0
        ? `${formatPercentage(pipeline.globalConversion)} · ${firstStage.count} ${firstStage.name} → ${lastStage?.count ?? 0} ${lastStage?.name ?? "etapa final"}`
        : "— · 0 postulados → 0 contratados"
      : "";

  return (
    <Card>
      <CardHeader className="gap-3 sm:flex sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle>Pipeline por vacante</CardTitle>
          <CardDescription className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
            <span>Postulaciones por etapa del proceso</span>
            {pipeline && globalConversionText && (
              <>
                <span className="text-text-muted">•</span>
                <span className="font-medium text-text-primary">
                  Conversión de punta a punta: {globalConversionText}
                </span>
              </>
            )}
          </CardDescription>
        </div>
        {closedOpenings.length > 0 && (
          <div className="w-full sm:min-w-[20rem] sm:max-w-[28rem]">
            <label
              htmlFor="metrics-job-opening"
              className="mb-1.5 block text-xs font-medium text-text-secondary"
            >
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
                className="w-full min-w-0"
              >
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
      </CardHeader>
      <CardContent>
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
          <div className="space-y-3">
            <div className="space-y-3">
              {pipeline.stages.map((stage, index) => {
                const nextStage = pipeline.stages[index + 1];
                const maxStageCount = Math.max(
                  ...pipeline.stages.map((item) => item.count),
                  1,
                );
                const barWidth =
                  maxStageCount > 0 ? (stage.count / maxStageCount) * 100 : 0;
                const advancePercentage =
                  nextStage && stage.count > 0
                    ? (nextStage.count / stage.count) * 100
                    : null;

                return (
                  <div key={stage.id} className="space-y-1.5">
                    <div className="grid grid-cols-[minmax(0,12rem)_minmax(0,1fr)_auto] items-center gap-3">
                      <span className="min-w-0 truncate text-sm text-text-secondary">
                        {stage.name}
                      </span>
                      <div className="h-2.5 overflow-hidden rounded-full bg-surface-subtle">
                        <div
                          className="h-full rounded-full bg-[var(--accent-purple-strong)]"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-text-primary">
                        {stage.count}
                      </span>
                    </div>
                    {nextStage && (
                      <div className="flex justify-center">
                        <span className="inline-flex rounded-full bg-surface-subtle px-2 py-0.5 text-[10px] font-medium text-text-secondary">
                          {advancePercentage === null
                            ? "—"
                            : `${Math.round(advancePercentage)} %`}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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
