import { TRPCError } from "@trpc/server";

import type { Prisma } from "~/generated/prisma/client";
import { JobOpeningStatus } from "~/generated/prisma/enums";
import { auth } from "~/lib/auth";
import {
  getMetricStageName,
  getPendingMetricStages,
} from "~/lib/stage-metrics";
import { parseStages } from "~/lib/validations/job-opening";
import type { StageTarget } from "~/lib/validations/stage-metrics";
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

// Applies the reviewed target days and checks the metric stages are ready
// for closing the job opening. Returns the stages to persist.
export function getClosingStages(
  stagesJson: Prisma.JsonValue,
  stageTargets: StageTarget[] = [],
) {
  let stageRecords = getStageRecords(stagesJson);

  for (const { stageKey, targetDays } of stageTargets) {
    stageRecords = updateStageRecord(stageRecords, stageKey, { targetDays });
  }

  const stages = parseStages(stageRecords);
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
