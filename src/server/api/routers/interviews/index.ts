import { createTRPCRouter } from "~/server/api/trpc";
import { getInterviewsByApplicantIdProcedure } from "./get-interviews-by-applicant-id";
import { getAssignedInterviews } from "./get-assigned-interviews";
import { createInterviewProcedure } from "./create-interview";
import { deleteInterviewProcedure } from "./delete-interview";

export { getAssignedInterviews };

export const interviewsRouter = createTRPCRouter({
  getAllByApplicantId: getInterviewsByApplicantIdProcedure,
  getAssignedInterviews,
  create: createInterviewProcedure,
  delete: deleteInterviewProcedure,
});
