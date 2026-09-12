import { z } from "zod";

import { protectedProcedure } from "~/server/api/trpc";
import { getApplicationsByCandidateId } from "~/server/logic/application-service";

export const getApplicationsByCandidateIdProcedure = protectedProcedure
  .input(
    z.object({
      candidateId: z.string().min(1),
    }),
  )
  .query(async ({ input }) => {
    return getApplicationsByCandidateId(input.candidateId);
  });
