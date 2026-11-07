import { reopenStageSchema } from "~/lib/validations/stage-metrics";
import { protectedProcedure } from "~/server/api/trpc";
import {
  assertCanUpdateJobOpening,
  findMetricStage,
  getStageRecords,
  saveStages,
  updateStageRecord,
} from "./stage-metrics-utils";

export const reopenStage = protectedProcedure
  .input(reopenStageSchema)
  .mutation(async ({ ctx, input }) => {
    await assertCanUpdateJobOpening(ctx);

    const { jobOpening } = await findMetricStage(
      ctx,
      input.jobOpeningId,
      input.stageKey,
    );

    await saveStages(
      ctx,
      jobOpening.id,
      jobOpening.stages,
      updateStageRecord(getStageRecords(jobOpening.stages), input.stageKey, {
        closedAt: null,
      }),
    );

    return { stageKey: input.stageKey };
  });
