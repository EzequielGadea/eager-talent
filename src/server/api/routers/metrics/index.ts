import { createTRPCRouter } from "~/server/api/trpc";
import { getClosedOpenings } from "./get-closed-openings";
import { getJobOpeningDeviations } from "./get-job-opening-deviations";
import { getMetricsSummary } from "./get-summary";
import { getPipeline } from "./get-pipeline";
import { getTimeMetrics } from "./get-time-metrics";

export {
  getClosedOpenings,
  getJobOpeningDeviations,
  getMetricsSummary,
  getPipeline,
  getTimeMetrics,
};

export const metricsRouter = createTRPCRouter({
  getClosedOpenings,
  getJobOpeningDeviations,
  getMetricsSummary,
  getPipeline,
  getTimeMetrics,
});
