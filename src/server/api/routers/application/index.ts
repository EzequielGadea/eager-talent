import { createTRPCRouter } from "~/server/api/trpc";
import { getApplicationsByApplicantIdProcedure } from "./get-applications-by-applicant-id";

export const applicationRouter = createTRPCRouter({
  getAllByApplicantId: getApplicationsByApplicantIdProcedure,
});
