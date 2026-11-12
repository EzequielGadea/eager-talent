import { tz } from "@date-fns/tz";
import { format } from "date-fns";

import { normalizeStageName } from "~/lib/required-stage-types";

// Stages tracked by the stage deviation metrics, in process order.
export const METRIC_STAGE_NAMES = [
  "Entrevista HR",
  "Entrevista Técnica",
] as const;

export type MetricStageName = (typeof METRIC_STAGE_NAMES)[number];

const METRIC_STAGE_BY_NORMALIZED_NAME = new Map<string, MetricStageName>(
  METRIC_STAGE_NAMES.map((name) => [normalizeStageName(name), name]),
);

export type MetricStageData = {
  key: string;
  name: string;
  targetDays?: number | null;
  closedAt?: string | null;
};

export function getMetricStageName(stage: { name: string }) {
  return METRIC_STAGE_BY_NORMALIZED_NAME.get(normalizeStageName(stage.name));
}

export function isMetricStage(stage: { name: string }) {
  return getMetricStageName(stage) !== undefined;
}

// Metric stages of a flow, in METRIC_STAGE_NAMES order.
export function getMetricStages<T extends { name: string }>(
  stages: readonly T[],
) {
  return METRIC_STAGE_NAMES.flatMap((metricStageName) => {
    const stage = stages.find(
      (candidate) => getMetricStageName(candidate) === metricStageName,
    );

    return stage ? [stage] : [];
  });
}

// Dates are compared as UTC calendar days (yyyy-MM-dd), like the metrics.
export function toIsoDate(date: Date) {
  return format(date, "yyyy-MM-dd", { in: tz("UTC") });
}

export function getStageClosingDateError({
  stages,
  stageKey,
  closedAt,
  openingDate,
  today,
}: {
  stages: readonly MetricStageData[];
  stageKey: string;
  closedAt: string;
  openingDate: string;
  today: string;
}) {
  if (closedAt < openingDate) {
    return "La fecha de cierre de la etapa no puede ser anterior a la fecha de apertura de la vacante.";
  }

  if (closedAt > today) {
    return "La fecha de cierre de la etapa no puede ser posterior a hoy.";
  }

  const metricStages = getMetricStages(stages);
  const index = metricStages.findIndex((stage) => stage.key === stageKey);
  const previousStage = index > 0 ? metricStages[index - 1] : undefined;
  const nextStage = index >= 0 ? metricStages[index + 1] : undefined;

  if (previousStage?.closedAt && closedAt < previousStage.closedAt) {
    return `La fecha de cierre no puede ser anterior al cierre de la etapa ${previousStage.name}.`;
  }

  if (nextStage?.closedAt && closedAt > nextStage.closedAt) {
    return `La fecha de cierre no puede ser posterior al cierre de la etapa ${nextStage.name}.`;
  }

  return undefined;
}

// A closed metric stage does not accept candidates until it is reopened.
export function getClosedStageError(
  stage: { name: string; closedAt?: string | null } | undefined,
) {
  return stage && isMetricStage(stage) && stage.closedAt
    ? `La etapa ${stage.name} está cerrada. Reabrila desde el Pipeline para sumar candidatos.`
    : undefined;
}

// Metric stages that still block closing the job opening.
export function getPendingMetricStages<T extends MetricStageData>(
  stages: readonly T[],
) {
  return getMetricStages(stages).filter((stage) => !stage.closedAt);
}
