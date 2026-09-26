import { createTRPCRouter } from "~/server/api/trpc";
import { getInterviewsByApplicantIdProcedure } from "./get-interviews-by-applicant-id";
import { createInterviewProcedure } from "./create-interview";

export const interviewsRouter = createTRPCRouter({
  getAllByApplicantId: getInterviewsByApplicantIdProcedure,
  create: createInterviewProcedure,
});
