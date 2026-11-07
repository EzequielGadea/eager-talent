import { parseISO } from "date-fns";

import { getMetricStages } from "~/lib/stage-metrics";
import { parseStages } from "~/lib/validations/job-opening";
import { metricsFilterSchema } from "~/lib/validations/metrics";
import { protectedProcedure } from "~/server/api/trpc";
import { authorizeRecruiter } from "./authorize-recruiter";
import { differenceInMetricDays } from "./date-utils";
import { getMetricsJobOpeningWhere } from "./filter";

function toAverageDeviation(deviations: number[]) {
  return {
    averageDeviationDays: deviations.length
      ? Math.round(
          deviations.reduce((total, days) => total + days, 0) /
            deviations.length,
        )
      : null,
    count: deviations.length,
  };
}

// Average deviation of the HR and technical interview stages across every
// closed job opening in the filter.
// HR real duration: job opening opening date -> HR stage closing date.
// Technical real duration: HR stage closing date -> technical stage closing date.
export const getStageDeviations = protectedProcedure
  .input(metricsFilterSchema)
  .query(async ({ ctx, input }) => {
    await authorizeRecruiter(ctx);

    const jobOpenings = await ctx.db.jobOpening.findMany({
      where: getMetricsJobOpeningWhere(input),
      select: { openingDate: true, stages: true },
    });

    const hrDeviations: number[] = [];
    const technicalDeviations: number[] = [];

    for (const jobOpening of jobOpenings) {
      const [hrStage, technicalStage] = getMetricStages(
        parseStages(jobOpening.stages),
      );

      if (!hrStage?.closedAt) continue;

      const hrClosingDate = parseISO(`${hrStage.closedAt}T00:00:00Z`);

      if (hrStage.targetDays) {
        hrDeviations.push(
          differenceInMetricDays(hrClosingDate, jobOpening.openingDate) -
            hrStage.targetDays,
        );
      }

      if (technicalStage?.closedAt && technicalStage.targetDays) {
        technicalDeviations.push(
          differenceInMetricDays(
            parseISO(`${technicalStage.closedAt}T00:00:00Z`),
            hrClosingDate,
          ) - technicalStage.targetDays,
        );
      }
    }

    return {
      hr: toAverageDeviation(hrDeviations),
      technical: toAverageDeviation(technicalDeviations),
    };
  });
