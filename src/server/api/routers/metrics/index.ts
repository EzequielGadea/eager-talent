import { createTRPCRouter } from "~/server/api/trpc";
import { getClosedOpenings } from "./get-closed-openings";
import { getMetricsSummary } from "./get-summary";
import { getPipeline } from "./get-pipeline";

export { getClosedOpenings, getMetricsSummary, getPipeline };

export const metricsRouter = createTRPCRouter({
  getClosedOpenings,
  getMetricsSummary,
  getPipeline,
});
