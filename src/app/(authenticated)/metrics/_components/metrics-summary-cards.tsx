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
          ? "border-2 border-emerald-500 bg-emerald-50 ring-0"
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
          <p className="text-2xl font-bold text-text-primary tabular-nums">
            {value}
          </p>
        )}
        {detail ? (
          <p className="text-sm text-text-secondary">{detail}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function PendingMetricCard({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <Card aria-label={`${label}: próximamente`}>
      <CardContent className="flex min-h-40 flex-col justify-center gap-2">
        <div className="text-text-tertiary">{icon}</div>
        <p className="text-sm font-medium text-text-secondary">{label}</p>
        <Skeleton className="h-8 w-24" />
        <p className="text-xs font-medium text-text-tertiary">Próximamente</p>
      </CardContent>
    </Card>
  );
}

export function MetricsSummaryCards({
  metrics,
  isPending,
}: {
  metrics: TimeMetrics;
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
        icon={<Clock className="size-5 text-red-500" aria-hidden="true" />}
        label="Tiempo prom. cierre total"
        value={
          metrics.averageClosingDays === null
            ? null
            : formatDays(metrics.averageClosingDays)
        }
      />
      <MetricCard
        icon={
          <TrendingUp className="size-5 text-violet-500" aria-hidden="true" />
        }
        label="Desvío total promedio"
        value={
          metrics.averageDeviationDays === null
            ? null
            : formatSignedDays(metrics.averageDeviationDays)
        }
      />
      <PendingMetricCard
        icon={<UserRound className="size-5" aria-hidden="true" />}
        label="Desvío desde HR"
      />
      <PendingMetricCard
        icon={<CodeXml className="size-5" aria-hidden="true" />}
        label="Desvío resp. técnica"
      />
      <MetricCard
        icon={
          <CircleCheck className="size-5 text-emerald-600" aria-hidden="true" />
        }
        label="% vacantes en plazo"
        value={
          metrics.onTimePercentage === null
            ? null
            : `${metrics.onTimePercentage}%`
        }
        detail={
          metrics.totalClosed > 0
            ? `${metrics.onTimeCount} de ${metrics.totalClosed} cerradas`
            : undefined
        }
        highlighted={metrics.onTimePercentage !== null}
      />
    </section>
  );
}
