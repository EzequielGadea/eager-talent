import { Suspense } from "react";
import { AccessDenied } from "~/components/access-denied";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/lib/trpc/server";
import {
  defaultMetricsPeriod,
  metricsPeriodSchema,
  type MetricsPeriod,
} from "~/lib/validations/metrics";
import { MetricsDashboard } from "./_components/metrics-dashboard";
import { MetricsSummaryCards } from "./_components/metrics-summary-cards";
import { DisqualificationChart } from "./_components/disqualification-chart";
import { SourcesChart } from "./_components/sources-chart";
import { PipelineChart } from "./_components/pipeline-chart";
import { JobOpeningDeviations } from "./_components/job-opening-deviations";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function MetricsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense fallback={<PageFallback />}>
      <MetricsContent searchParams={searchParams} />
    </Suspense>
  );
}

async function MetricsContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await api.user.getCurrent();
  if (!user.role || !["recruiter", "admin", "owner"].includes(user.role)) {
    return (
      <AccessDenied
        title="No tenés acceso a Métricas"
        description="Esta sección está disponible únicamente para usuarios con rol Recruiter."
      />
    );
  }

  const params = await searchParams;
  const periodParam =
    typeof params.period === "string" ? params.period : defaultMetricsPeriod;
  const period = metricsPeriodSchema.safeParse(periodParam).success
    ? metricsPeriodSchema.parse(periodParam)
    : defaultMetricsPeriod;
  const areaId = typeof params.areaId === "string" ? params.areaId : undefined;
  const pageNumber = Number(params.page);
  const page = Number.isInteger(pageNumber) && pageNumber > 0 ? pageNumber : 1;
  const openingId =
    typeof params.openingId === "string" ? params.openingId : undefined;
  const filters = { period, areaId };
  const areas = await api.area.getAllAreas({});

  return (
    <MetricsDashboard
      areas={areas.map(({ id, name }) => ({ id, name }))}
      period={period}
      areaId={areaId}
    >
      <Suspense
        key={`time-${period}-${areaId ?? "all"}`}
        fallback={<CardsFallback />}
      >
        <TimeMetricsSection filters={filters} />
      </Suspense>
      <Suspense
        key={`deviations-${period}-${areaId ?? "all"}-${page}`}
        fallback={<DeviationsFallback />}
      >
        <DeviationsSection filters={filters} page={page} />
      </Suspense>
      <Suspense
        key={`summary-${period}-${areaId ?? "all"}`}
        fallback={<ChartsFallback />}
      >
        <SummarySection filters={filters} />
      </Suspense>
      <Suspense
        key={`pipeline-${period}-${areaId ?? "all"}-${openingId ?? "first"}`}
        fallback={<PipelineFallback />}
      >
        <PipelineSection filters={filters} selectedOpeningId={openingId} />
      </Suspense>
    </MetricsDashboard>
  );
}

function PageFallback() {
  return (
    <div
      className="flex flex-col gap-6"
      role="status"
      aria-label="Cargando métricas"
    >
      <Skeleton className="h-10 w-48" />
      <div className="flex gap-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-48" />
      </div>
      <CardsFallback />
    </div>
  );
}

async function TimeMetricsSection({
  filters,
}: {
  filters: { period: MetricsPeriod; areaId?: string };
}) {
  const metrics = await api.metrics.getTimeMetrics(filters);
  return <MetricsSummaryCards metrics={metrics} isPending={false} />;
}

async function DeviationsSection({
  filters,
  page,
}: {
  filters: { period: MetricsPeriod; areaId?: string };
  page: number;
}) {
  const data = await api.metrics.getJobOpeningDeviations({ ...filters, page });
  return <JobOpeningDeviations data={data} isLoading={false} pageInUrl />;
}

async function SummarySection({
  filters,
}: {
  filters: { period: MetricsPeriod; areaId?: string };
}) {
  const summary = await api.metrics.getMetricsSummary(filters);
  return (
    <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
      <DisqualificationChart
        motives={summary.disqualificationMotives}
        isLoading={false}
      />
      <SourcesChart sources={summary.applicationSources} isLoading={false} />
    </div>
  );
}

async function PipelineSection({
  filters,
  selectedOpeningId,
}: {
  filters: { period: MetricsPeriod; areaId?: string };
  selectedOpeningId?: string;
}) {
  const closedOpenings = await api.metrics.getClosedOpenings(filters);
  const selected =
    closedOpenings.find((opening) => opening.id === selectedOpeningId) ??
    closedOpenings[0];
  const pipeline = selected
    ? await api.metrics.getPipeline({ jobOpeningId: selected.id })
    : undefined;
  return (
    <PipelineChart
      closedOpenings={closedOpenings}
      selectedOpeningId={selected?.id}
      pipeline={pipeline}
    />
  );
}

function CardsFallback() {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5"
      role="status"
      aria-label="Cargando indicadores"
    >
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className="flex min-h-40 flex-col justify-center gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
        >
          <Skeleton className="size-5 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

function DeviationsFallback() {
  return (
    <div
      className="space-y-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
      role="status"
      aria-label="Cargando desvíos"
    >
      <Skeleton className="h-5 w-56" />
      <Skeleton className="h-4 w-72" />
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="grid grid-cols-[220px_1fr_80px] gap-3">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-4 w-full rounded-full" />
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  );
}

function ChartsFallback() {
  return (
    <div
      className="grid grid-cols-1 gap-4 lg:grid-cols-2"
      role="status"
      aria-label="Cargando gráficos"
    >
      {[0, 1].map((i) => (
        <div
          key={i}
          className="flex min-h-[25rem] flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
        >
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-1/2" />
        </div>
      ))}
    </div>
  );
}

function PipelineFallback() {
  return (
    <div
      className="min-h-72 space-y-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
      role="status"
      aria-label="Cargando pipeline"
    >
      <Skeleton className="h-6 w-56" />
      {Array.from({ length: 5 }, (_, i) => (
        <Skeleton key={i} className="h-5 w-full" />
      ))}
    </div>
  );
}
