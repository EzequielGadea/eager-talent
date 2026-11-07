import { TRPCError } from "@trpc/server";

import { getMetricStages, toIsoDate } from "~/lib/stage-metrics";
import { parseStages } from "~/lib/validations/job-opening";
import { getStageMetricsSchema } from "~/lib/validations/stage-metrics";
import { protectedProcedure } from "~/server/api/trpc";
import { assertCanUpdateJobOpening } from "./stage-metrics-utils";

// Metric stages of a job opening, reviewed before closing it.
export const getStageMetrics = protectedProcedure
  .input(getStageMetricsSchema)
  .query(async ({ ctx, input }) => {
    await assertCanUpdateJobOpening(ctx);

    const jobOpening = await ctx.db.jobOpening.findUnique({
      where: { id: input.jobOpeningId },
      select: { id: true, openingDate: true, stages: true },
    });

    if (!jobOpening) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Vacante no encontrada",
      });
    }

    const metricStages = getMetricStages(parseStages(jobOpening.stages));
    const candidateCounts = await ctx.db.application.groupBy({
      by: ["currentStageId"],
      where: {
        jobOpeningId: jobOpening.id,
        currentStageId: { in: metricStages.map((stage) => stage.key) },
        active: true,
        deletedAt: null,
      },
      _count: { _all: true },
    });

    return {
      openingDate: toIsoDate(jobOpening.openingDate),
      stages: metricStages.map((stage) => ({
        key: stage.key,
        name: stage.name,
        targetDays: stage.targetDays ?? null,
        closedAt: stage.closedAt ?? null,
        candidatesCount:
          candidateCounts.find(
            ({ currentStageId }) => currentStageId === stage.key,
          )?._count._all ?? 0,
      })),
    };
  });
