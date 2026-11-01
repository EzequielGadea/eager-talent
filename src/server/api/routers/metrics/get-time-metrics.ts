import { metricsFilterSchema } from "~/lib/validations/metrics";
import { protectedProcedure } from "~/server/api/trpc";
import { authorizeRecruiter } from "./authorize-recruiter";
import { differenceInMetricDays } from "./date-utils";
import {
  getMetricsJobOpeningWhere,
  getMetricsOpenJobOpeningWhere,
} from "./filter";

export const getTimeMetrics = protectedProcedure
  .input(metricsFilterSchema)
  .query(async ({ ctx, input }) => {
    await authorizeRecruiter(ctx);

    const now = new Date();
    const [jobOpenings, openJobOpenings] = await Promise.all([
      ctx.db.jobOpening.findMany({
        where: getMetricsJobOpeningWhere(input, now),
        select: {
          openingDate: true,
          targetClosingDate: true,
          closingDate: true,
        },
      }),
      ctx.db.jobOpening.findMany({
        where: getMetricsOpenJobOpeningWhere(input, now),
        select: { targetClosingDate: true },
      }),
    ]);

    const metrics = jobOpenings.flatMap((jobOpening) => {
      if (!jobOpening.closingDate) return [];

      return [
        {
          durationDays: differenceInMetricDays(
            jobOpening.closingDate,
            jobOpening.openingDate,
          ),
          deviationDays: differenceInMetricDays(
            jobOpening.closingDate,
            jobOpening.targetClosingDate,
          ),
        },
      ];
    });

    const totalDurationDays = metrics.reduce(
      (total, metric) => total + metric.durationDays,
      0,
    );
    const totalDeviationDays = metrics.reduce(
      (total, metric) => total + metric.deviationDays,
      0,
    );
    const closedOnTimeCount = metrics.filter(
      (metric) => metric.deviationDays <= 0,
    ).length;
    const openOnTimeCount = openJobOpenings.filter(
      (jobOpening) =>
        differenceInMetricDays(jobOpening.targetClosingDate, now) >= 0,
    ).length;
    const onTimeCount = closedOnTimeCount + openOnTimeCount;
    const totalConsidered = metrics.length + openJobOpenings.length;

    return {
      averageClosingDays: metrics.length
        ? Math.round(totalDurationDays / metrics.length)
        : null,
      averageDeviationDays: metrics.length
        ? Math.round(totalDeviationDays / metrics.length)
        : null,
      onTimePercentage: totalConsidered
        ? Math.round((onTimeCount / totalConsidered) * 100)
        : null,
      onTimeCount,
      totalClosed: metrics.length,
      totalConsidered,
    };
  });
