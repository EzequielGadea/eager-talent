import { TRPCError } from "@trpc/server";

import { getStageClosingDateError, toIsoDate } from "~/lib/stage-metrics";
import { closeStageSchema } from "~/lib/validations/stage-metrics";
import { protectedProcedure } from "~/server/api/trpc";
import {
  assertCanUpdateJobOpening,
  findMetricStage,
  getStageRecords,
  saveStages,
  updateStageRecord,
} from "./stage-metrics-utils";

export const closeStage = protectedProcedure
  .input(closeStageSchema)
  .mutation(async ({ ctx, input }) => {
    await assertCanUpdateJobOpening(ctx);

    const { jobOpening, stages } = await findMetricStage(
      ctx,
      input.jobOpeningId,
      input.stageKey,
    );

    const closingDateError = getStageClosingDateError({
      stages,
      stageKey: input.stageKey,
      closedAt: input.closedAt,
      openingDate: toIsoDate(jobOpening.openingDate),
      today: toIsoDate(new Date()),
    });

    if (closingDateError) {
      throw new TRPCError({ code: "BAD_REQUEST", message: closingDateError });
    }

    // Disqualified applications are no longer in the pipeline, so they don't block.
    const candidatesInStage = await ctx.db.application.count({
      where: {
        jobOpeningId: jobOpening.id,
        currentStageId: input.stageKey,
        active: true,
        deletedAt: null,
      },
    });

    if (candidatesInStage > 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No se puede cerrar la etapa mientras tenga candidatos.",
      });
    }

    await saveStages(
      ctx,
      jobOpening.id,
      jobOpening.stages,
      updateStageRecord(getStageRecords(jobOpening.stages), input.stageKey, {
        closedAt: input.closedAt,
      }),
    );

    return { stageKey: input.stageKey, closedAt: input.closedAt };
  });
