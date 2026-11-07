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
