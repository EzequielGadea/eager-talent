import { createTRPCRouter } from "~/server/api/trpc";
import { getInterviewsByApplicantIdProcedure } from "./get-interviews-by-applicant-id";

export const interviewsRouter = createTRPCRouter({
  getAllByApplicantId: getInterviewsByApplicantIdProcedure,
});
