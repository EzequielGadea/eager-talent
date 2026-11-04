import {
  METRICS_PAGE_SIZE,
  metricsDeviationFilterSchema,
} from "~/lib/validations/metrics";
import { protectedProcedure } from "~/server/api/trpc";
import { authorizeRecruiter } from "./authorize-recruiter";
import { differenceInMetricDays } from "./date-utils";
import { getMetricsJobOpeningWhere } from "./filter";

export const getJobOpeningDeviations = protectedProcedure
  .input(metricsDeviationFilterSchema)
  .query(async ({ ctx, input }) => {
    await authorizeRecruiter(ctx);

    const jobOpenings = await ctx.db.jobOpening.findMany({
      where: getMetricsJobOpeningWhere(input),
      select: {
        id: true,
        name: true,
        openingDate: true,
        targetClosingDate: true,
        closingDate: true,
      },
    });

    const deviations = jobOpenings
      .flatMap((jobOpening) => {
        if (!jobOpening.closingDate) return [];

        const durationDays = differenceInMetricDays(
          jobOpening.closingDate,
          jobOpening.openingDate,
        );
        const targetDurationDays = differenceInMetricDays(
          jobOpening.targetClosingDate,
          jobOpening.openingDate,
        );
        const deviationDays = differenceInMetricDays(
          jobOpening.closingDate,
          jobOpening.targetClosingDate,
        );

        return [
          {
            id: jobOpening.id,
            name: jobOpening.name,
            durationDays,
            targetDurationDays,
            deviationDays,
            isOnTime: deviationDays <= 0,
          },
        ];
      })
      .sort(
        (first, second) =>
          second.deviationDays - first.deviationDays ||
          first.name.localeCompare(second.name),
      );

    const total = deviations.length;
    const pageCount = Math.max(1, Math.ceil(total / METRICS_PAGE_SIZE));
    const page = Math.min(input.page, pageCount);
    const start = (page - 1) * METRICS_PAGE_SIZE;
    const items = deviations.slice(start, start + METRICS_PAGE_SIZE);
    const maximumDurationDays = deviations.reduce(
      (maximum, deviation) =>
        Math.max(maximum, deviation.durationDays, deviation.targetDurationDays),
      0,
    );

    return {
      items,
      total,
      page,
      pageCount,
      pageSize: METRICS_PAGE_SIZE,
      scaleMaximumDays: maximumDurationDays + 5,
      highestDeviation: deviations[0] ?? null,
    };
  });
