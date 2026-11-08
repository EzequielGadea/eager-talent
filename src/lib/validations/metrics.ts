import { z } from "zod";

export const metricsPeriodSchema = z.enum([
  "currentMonth",
  "previousMonth",
  "currentQuarter",
  "previousQuarter",
  "currentSemester",
  "previousSemester",
  "currentYear",
  "previousYear",
  "all",
]);

export type MetricsPeriod = z.infer<typeof metricsPeriodSchema>;

export const defaultMetricsPeriod: MetricsPeriod = "currentMonth";

export const metricsFilterSchema = z.object({
  period: metricsPeriodSchema.default(defaultMetricsPeriod),
  areaId: z.string().min(1).optional(),
});

export type MetricsFilterInput = z.infer<typeof metricsFilterSchema>;

export const metricsDeviationFilterSchema = metricsFilterSchema.extend({
  page: z.coerce.number().int().min(1).default(1),
});

export type MetricsDeviationFilterInput = z.infer<
  typeof metricsDeviationFilterSchema
>;

export const METRICS_PAGE_SIZE = 5;
