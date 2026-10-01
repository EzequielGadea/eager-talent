import { createTRPCRouter } from "~/server/api/trpc";
import { getApplicationsByApplicantIdProcedure } from "./get-applications-by-applicant-id";
import { createApplication } from "./create-application";
import { fetchAvailableApplicants } from "./fetch-available-applicants";
import { advanceApplicationStage } from "./advance-application-stage";

export const applicationRouter = createTRPCRouter({
  getAllByApplicantId: getApplicationsByApplicantIdProcedure,
  fetchAvailableApplicants,
  createApplication,
  advanceApplicationStage,
});
