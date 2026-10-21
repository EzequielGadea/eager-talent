import { createTRPCRouter } from "~/server/api/trpc";
import { getInterviewsByApplicantIdProcedure } from "./get-interviews-by-applicant-id";
import { getAssignedInterviews } from "./get-assigned-interviews";
import { createInterviewProcedure } from "./create-interview";
import { deleteInterviewProcedure } from "./delete-interview";
import { getInterviewByIdProcedure } from "./get-by-id";
import { updateInterviewProcedure } from "./update-interview";
import { checkInterviewCurrentStageProcedure } from "./check-current-stage";
import { getInterviewAmount } from "./get-amount";

export { getAssignedInterviews };

export const interviewsRouter = createTRPCRouter({
  getAllByApplicantId: getInterviewsByApplicantIdProcedure,
  getAssignedInterviews,
  getById: getInterviewByIdProcedure,
  create: createInterviewProcedure,
  update: updateInterviewProcedure,
  delete: deleteInterviewProcedure,
  checkCurrentStage: checkInterviewCurrentStageProcedure,
  getInterviewAmount,
});
