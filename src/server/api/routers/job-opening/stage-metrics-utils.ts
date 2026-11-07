import { TRPCError } from "@trpc/server";

import type { Prisma } from "~/generated/prisma/client";
import { JobOpeningStatus } from "~/generated/prisma/enums";
import { auth } from "~/lib/auth";
import {
  getMetricStageName,
  getMetricStages,
  getPendingMetricStages,
  getStageClosingDateError,
  toIsoDate,
} from "~/lib/stage-metrics";
import { parseStages } from "~/lib/validations/job-opening";
import type {
  StageClosing,
  StageTarget,
} from "~/lib/validations/stage-metrics";
import type { createTRPCContext } from "~/server/api/trpc";

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

type StageRecord = Record<string, unknown>;

export async function assertCanUpdateJobOpening(ctx: Context) {
  const permission = await auth.api.hasPermission({
    headers: ctx.headers,
    body: {
      permissions: {
        jobOpening: ["update"],
      },
    },
  });

  if (!permission.success) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "No tienes permiso para modificar la vacante",
    });
  }
}

// Keeps every stage field as stored, so only the metric fields change.
export function getStageRecords(stages: Prisma.JsonValue): StageRecord[] {
  if (!Array.isArray(stages)) return [];

  return stages.flatMap((stage) =>
    typeof stage === "object" && stage !== null && !Array.isArray(stage)
      ? [stage as StageRecord]
      : [],
  );
}

export function updateStageRecord(
  stages: StageRecord[],
  stageKey: string,
  changes: StageRecord,
) {
  return stages.map((stage) =>
    stage.key === stageKey ? { ...stage, ...changes } : stage,
  );
}

export async function findMetricStage(
  ctx: Context,
  jobOpeningId: string,
  stageKey: string,
) {
  const jobOpening = await ctx.db.jobOpening.findUnique({
    where: { id: jobOpeningId },
    select: { id: true, status: true, openingDate: true, stages: true },
  });

  if (!jobOpening) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Vacante no encontrada",
    });
  }

  if (
    jobOpening.status === JobOpeningStatus.Closed ||
    jobOpening.status === JobOpeningStatus.Cancelled
  ) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "No se pueden modificar las etapas de una vacante cerrada o cancelada",
    });
  }

  const stages = parseStages(jobOpening.stages);
  const stage = stages.find((candidate) => candidate.key === stageKey);

  if (!stage || !getMetricStageName(stage)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "La etapa no forma parte de las métricas de desvío",
    });
  }

  return { jobOpening, stages, stage };
}

// Saves the stages only if nobody changed them since they were read.
export async function saveStages(
  ctx: Context,
  jobOpeningId: string,
  previousStages: Prisma.JsonValue,
  nextStages: StageRecord[],
) {
  const { count } = await ctx.db.jobOpening.updateMany({
    where: {
      id: jobOpeningId,
      status: {
        notIn: [JobOpeningStatus.Closed, JobOpeningStatus.Cancelled],
      },
      stages: { equals: previousStages as Prisma.InputJsonValue },
    },
    data: { stages: nextStages as Prisma.InputJsonValue },
  });

  if (count !== 1) {
    throw new TRPCError({
      code: "CONFLICT",
      message:
        "La vacante cambió mientras se guardaba. Recargá e intentá de nuevo.",
    });
  }
}

// Applies the target days edited in the job opening form (metric stages only).
export function applyStageTargets(
  stagesJson: Prisma.JsonValue,
  stageTargets: StageTarget[],
) {
  const metricStageKeys = new Set(
    getMetricStages(parseStages(stagesJson)).map((stage) => stage.key),
  );
  let stageRecords = getStageRecords(stagesJson);

  for (const { stageKey, targetDays } of stageTargets) {
    if (!metricStageKeys.has(stageKey)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Los días objetivo solo aplican a las etapas de las métricas",
      });
    }

    stageRecords = updateStageRecord(stageRecords, stageKey, { targetDays });
  }

  return stageRecords;
}

// Stores the closing dates entered for the still-open metric stages and checks
// every metric stage is ready for closing the job opening. Returns the stages
// to persist.
export async function getClosingStages(
  ctx: Context,
  jobOpening: {
    id: string;
    openingDate: Date;
    stages: Prisma.JsonValue;
  },
  stageClosings: StageClosing[] = [],
) {
  let stageRecords = getStageRecords(jobOpening.stages);
  const metricStages = getMetricStages(parseStages(stageRecords));
  const today = toIsoDate(new Date());

  // In process order, so each date is checked against the previous stage's.
  for (const metricStage of metricStages) {
    const closing = stageClosings.find(
      ({ stageKey }) => stageKey === metricStage.key,
    );

    if (!closing || metricStage.closedAt) continue;

    const closingDateError = getStageClosingDateError({
      stages: parseStages(stageRecords),
      stageKey: closing.stageKey,
      closedAt: closing.closedAt,
      openingDate: toIsoDate(jobOpening.openingDate),
      today,
    });

    if (closingDateError) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `${metricStage.name}: ${closingDateError}`,
      });
    }

    stageRecords = updateStageRecord(stageRecords, closing.stageKey, {
      closedAt: closing.closedAt,
    });
  }

  const stages = parseStages(stageRecords);
  const closedNowKeys = stageClosings.map(({ stageKey }) => stageKey);

  if (closedNowKeys.length > 0) {
    const candidatesInStages = await ctx.db.application.count({
      where: {
        jobOpeningId: jobOpening.id,
        currentStageId: { in: closedNowKeys },
        active: true,
        deletedAt: null,
      },
    });

    if (candidatesInStages > 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No se puede cerrar una etapa mientras tenga candidatos.",
      });
    }
  }

  const pendingStages = getPendingMetricStages(stages);

  if (pendingStages.length > 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Hay etapas requeridas para las métricas que todavía no fueron cerradas: ${pendingStages
        .map((stage) => stage.name)
        .join(", ")}`,
    });
  }

  const stageWithoutTarget = getPendingTargetStage(stages);

  if (stageWithoutTarget) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Definí los días objetivo de la etapa ${stageWithoutTarget.name}`,
    });
  }

  return stageRecords;
}

function getPendingTargetStage(stages: ReturnType<typeof parseStages>) {
  return stages.find((stage) => getMetricStageName(stage) && !stage.targetDays);
}
