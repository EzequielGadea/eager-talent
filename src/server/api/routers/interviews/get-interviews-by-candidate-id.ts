import { z } from "zod";

import { protectedProcedure } from "~/server/api/trpc";

export const getInterviewsByCandidateIdProcedure = protectedProcedure
  .input(
    z.object({
      candidateId: z.string().min(1),
    }),
  )
  .query(async ({ input, ctx }) => {
    return ctx.db.interview.findMany({
      where: {
        applicantId: input.candidateId,
      },
      orderBy: {
        date: "asc",
      },
      select: {
        id: true,
        name: true,
        duration: true,
        modality: true,
        date: true,
        status: true,
        summary: true,
        applicantId: true,
        jobOpeningId: true,
        interviewers: {
          select: {
            id: true,
            name: true,
            lastName: true,
          },
        },
      },
    });
  });