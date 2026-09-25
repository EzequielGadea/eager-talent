import { createTRPCRouter } from "~/server/api/trpc";
import { getApplicationsByApplicantIdProcedure } from "./get-applications-by-applicant-id";
import { createApplicationProcedure } from "./create";

export const applicationRouter = createTRPCRouter({
  getAllByApplicantId: getApplicationsByApplicantIdProcedure,
  createApplication: createApplicationProcedure,
});
