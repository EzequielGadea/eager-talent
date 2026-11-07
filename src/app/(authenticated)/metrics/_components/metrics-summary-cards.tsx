import type { ReactNode } from "react";
import {
  CircleCheck,
  Clock,
  CodeXml,
  TrendingUp,
  UserRound,
} from "lucide-react";

import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

type TimeMetrics = {
  averageClosingDays: number | null;
  averageDeviationDays: number | null;
  onTimePercentage: number | null;
  onTimeCount: number;
  totalClosed: number;
  totalConsidered: number;
};

type StageDeviation = {
  averageDeviationDays: number | null;
  count: number;
};

type StageDeviations = {
  hr: StageDeviation;
  technical: StageDeviation;
};

function formatDays(value: number) {
  return `${value} ${Math.abs(value) === 1 ? "día" : "días"}`;
}

function formatSignedDays(value: number) {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${formatDays(value)}`;
}

function MetricCard({
  icon,
  label,
  value,
  detail,
  highlighted = false,
}: {
  icon: ReactNode;
  label: string;
  value: string | null;
  detail?: string;
  highlighted?: boolean;
}) {
  return (
    <Card
      className={
        highlighted
          ? "border-2 border-success bg-success-bg ring-0"
          : "ring-foreground/10"
      }
    >
      <CardContent className="flex min-h-40 flex-col justify-center gap-2">
        <div className="text-text-secondary">{icon}</div>
        <p className="text-sm font-medium text-text-secondary">{label}</p>
        {value === null ? (
          <p className="text-sm text-text-tertiary">
            No hay datos para este filtro
          </p>
        ) : (
          <p className="text-h2 text-text-primary tabular-nums">{value}</p>
        )}
        {detail ? (
          <p className="text-sm text-text-secondary">{detail}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function formatStageDeviation(deviation: StageDeviation) {
  return deviation.averageDeviationDays === null
    ? null
    : formatSignedDays(deviation.averageDeviationDays);
}

function formatStageDeviationDetail(deviation: StageDeviation) {
  if (deviation.count === 0) return undefined;

  return `Promedio de ${deviation.count} ${
    deviation.count === 1 ? "vacante" : "vacantes"
  }`;
}

export function MetricsSummaryCards({
  metrics,
  stageDeviations,
  isPending,
}: {
  metrics: TimeMetrics;
  stageDeviations: StageDeviations;
  isPending: boolean;
}) {
  if (isPending) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <Card key={index}>
            <CardContent className="flex min-h-40 flex-col justify-center gap-3">
              <Skeleton className="size-5 rounded-full" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <section
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5"
      aria-label="Indicadores temporales"
    >
      <MetricCard
        icon={<Clock className="size-5 text-danger" aria-hidden="true" />}
        label="Tiempo prom. cierre total"
        value={
          metrics.averageClosingDays === null
            ? null
            : formatDays(metrics.averageClosingDays)
        }
      />
      <MetricCard
        icon={
          <TrendingUp
            className="size-5 text-accent-purple"
            aria-hidden="true"
          />
        }
        label="Desvío total promedio"
        value={
          metrics.averageDeviationDays === null
            ? null
            : formatSignedDays(metrics.averageDeviationDays)
        }
      />
      <MetricCard
        icon={<UserRound className="size-5" aria-hidden="true" />}
        label="Desvío desde HR"
        value={formatStageDeviation(stageDeviations.hr)}
        detail={formatStageDeviationDetail(stageDeviations.hr)}
      />
      <MetricCard
        icon={<CodeXml className="size-5" aria-hidden="true" />}
        label="Desvío resp. técnica"
        value={formatStageDeviation(stageDeviations.technical)}
        detail={formatStageDeviationDetail(stageDeviations.technical)}
      />
      <MetricCard
        icon={
          <CircleCheck
            className="size-5 text-accent-green-strong"
            aria-hidden="true"
          />
        }
        label="% vacantes en plazo"
        value={
          metrics.onTimePercentage === null
            ? null
            : `${metrics.onTimePercentage}%`
        }
        detail={
          metrics.totalConsidered > 0
            ? `${metrics.onTimeCount} de ${metrics.totalConsidered} vacantes en plazo`
            : undefined
        }
        highlighted={metrics.onTimePercentage !== null}
      />
    </section>
  );
}
