import { createTRPCRouter } from "~/server/api/trpc";
import { getApplicationsByApplicantIdProcedure } from "./get-applications-by-applicant-id";
import { createApplicationProcedure } from "./create";
import { createApplication } from "./create-application";
import { fetchAvailableApplicants } from "./fetch-available-applicants";
import { advanceApplicationStage } from "./advance-application-stage";
import { moveApplicationToStage } from "./move-application-to-stage";
import { disqualifyApplication } from "./disqualify-application";
import { requalifyApplication } from "./requalify-application";
import { fetchDisqualificationMotives } from "./fetch-disqualify-motives";

export const applicationRouter = createTRPCRouter({
  getAllByApplicantId: getApplicationsByApplicantIdProcedure,
  createApplicationFromApplicant: createApplicationProcedure,
  fetchAvailableApplicants,
  createApplication,
  advanceApplicationStage,
  moveApplicationToStage,
  disqualifyApplication,
  requalifyApplication,
  fetchDisqualificationMotives,
});
