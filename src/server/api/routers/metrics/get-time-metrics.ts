import { metricsFilterSchema } from "~/lib/validations/metrics";
import { protectedProcedure } from "~/server/api/trpc";
import { authorizeRecruiter } from "./authorize-recruiter";
import { differenceInMetricDays } from "./date-utils";
import { getMetricsJobOpeningWhere } from "./filter";

export const getTimeMetrics = protectedProcedure
  .input(metricsFilterSchema)
  .query(async ({ ctx, input }) => {
    await authorizeRecruiter(ctx);

    const jobOpenings = await ctx.db.jobOpening.findMany({
      where: getMetricsJobOpeningWhere(input),
      select: {
        openingDate: true,
        targetClosingDate: true,
        closingDate: true,
      },
    });

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

    if (metrics.length === 0) {
      return {
        averageClosingDays: null,
        averageDeviationDays: null,
        onTimePercentage: null,
        onTimeCount: 0,
        totalClosed: 0,
      };
    }

    const totalDurationDays = metrics.reduce(
      (total, metric) => total + metric.durationDays,
      0,
    );
    const totalDeviationDays = metrics.reduce(
      (total, metric) => total + metric.deviationDays,
      0,
    );
    const onTimeCount = metrics.filter(
      (metric) => metric.deviationDays <= 0,
    ).length;

    return {
      averageClosingDays: Math.round(totalDurationDays / metrics.length),
      averageDeviationDays: Math.round(totalDeviationDays / metrics.length),
      onTimePercentage: Math.round((onTimeCount / metrics.length) * 100),
      onTimeCount,
      totalClosed: metrics.length,
    };
  });
