import { createTRPCRouter } from "~/server/api/trpc";
import { getCandidateByIdProcedure } from "./get-by-id";

export const candidateRouter = createTRPCRouter({
  getById: getCandidateByIdProcedure,
});
