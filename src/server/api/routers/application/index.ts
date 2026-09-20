import { createTRPCRouter } from "~/server/api/trpc";
import { getApplicationsByCandidateIdProcedure } from "./get-applications-by-candidate-id";

export const applicationRouter = createTRPCRouter({
  getAllByCandidateId: getApplicationsByCandidateIdProcedure,
});