import { createTRPCRouter } from "~/server/api/trpc";
import { getApplicationsByCandidateIdProcedure } from "./get-by-candidate-id";

export const applicationRouter = createTRPCRouter({
  getByCandidateId: getApplicationsByCandidateIdProcedure,
});
