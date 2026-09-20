import { createTRPCRouter } from "~/server/api/trpc";
import { getInterviewsByCandidateIdProcedure } from "./get-interviews-by-candidate-id";

export const interviewsRouter = createTRPCRouter({
  getAllByCandidateId: getInterviewsByCandidateIdProcedure,
});