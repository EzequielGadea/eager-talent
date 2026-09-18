import { createTRPCRouter } from "~/server/api/trpc";
import { getActivitiesByCandidateIdProcedure } from "./get-by-candidate-id";

export { getActivitiesByCandidateIdProcedure };

export const activityRouter = createTRPCRouter({
  getByCandidateId: getActivitiesByCandidateIdProcedure,
});
