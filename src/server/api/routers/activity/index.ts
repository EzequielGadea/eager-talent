import { createTRPCRouter } from "~/server/api/trpc";
import { getActivitiesByApplicantIdProcedure } from "./get-by-applicant-id";

export { getActivitiesByApplicantIdProcedure };

export const activityRouter = createTRPCRouter({
  getByApplicantId: getActivitiesByApplicantIdProcedure,
});
