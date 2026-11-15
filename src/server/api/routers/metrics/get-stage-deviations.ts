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
// Both stages count their days from the job opening's opening date:
// real duration = stage closing date - opening date; deviation = real - target.
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

      const getDeviation = (stage: typeof hrStage) =>
        stage?.closedAt && stage.targetDays
          ? differenceInMetricDays(
              parseISO(`${stage.closedAt}T00:00:00Z`),
              jobOpening.openingDate,
            ) - stage.targetDays
          : null;

      const hrDeviation = getDeviation(hrStage);
      const technicalDeviation = getDeviation(technicalStage);

      if (hrDeviation !== null) hrDeviations.push(hrDeviation);
      if (technicalDeviation !== null) {
        technicalDeviations.push(technicalDeviation);
      }
    }

    return {
      hr: toAverageDeviation(hrDeviations),
      technical: toAverageDeviation(technicalDeviations),
    };
  });
