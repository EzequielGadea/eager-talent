import { z } from "zod";

import { protectedProcedure } from "~/server/api/trpc";

export const getApplicationsByCandidateIdProcedure = protectedProcedure
  .input(
    z.object({
      candidateId: z.string().min(1),
    }),
  )
  .query(async ({ input, ctx }) => {
    return ctx.db.application.findMany({
      where: {
        applicantId: input.candidateId,
      },
      orderBy: {
        applicationDate: "desc",
      },
      include: {
        jobOpening: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  });
