import { z } from "zod";

import { protectedProcedure } from "~/server/api/trpc";
import { getActivitiesByCandidateId } from "~/server/logic/activity-service";

export const getActivitiesByCandidateIdProcedure = protectedProcedure
  .input(
    z.object({
      candidateId: z.string().min(1),
    }),
  )
  .query(async ({ input }) => {
    return getActivitiesByCandidateId(input.candidateId);
  });
