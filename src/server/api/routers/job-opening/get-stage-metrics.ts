import { TRPCError } from "@trpc/server";

import { getMetricStages } from "~/lib/stage-metrics";
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
      select: { stages: true },
    });

    if (!jobOpening) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Vacante no encontrada",
      });
    }

    return getMetricStages(parseStages(jobOpening.stages)).map((stage) => ({
      key: stage.key,
      name: stage.name,
      targetDays: stage.targetDays ?? null,
      closedAt: stage.closedAt ?? null,
    }));
  });
