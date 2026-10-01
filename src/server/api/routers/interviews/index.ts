import { createTRPCRouter } from "~/server/api/trpc";
import { getInterviewsByApplicantIdProcedure } from "./get-interviews-by-applicant-id";
import { getAssignedInterviews } from "./get-assigned-interviews";

export {getAssignedInterviews};

export const interviewsRouter = createTRPCRouter({
  getAllByApplicantId: getInterviewsByApplicantIdProcedure,
  getAssignedInterviews,
});
