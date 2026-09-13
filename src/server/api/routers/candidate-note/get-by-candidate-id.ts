import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "~/server/api/trpc";

export const getCandidateNoteByCandidateIdProcedure = protectedProcedure
  .input(
    z.object({
      candidateId: z.string().min(1),
    }),
  )
  .query(async ({ ctx, input }) => {
    const note = await ctx.db.applicantNote.findUnique({
      where: {
        applicantId: input.candidateId,
      },
      select: {
        id: true,
        content: true,
        lastModified: true,
        applicantId: true,
        lastModifiedBy: {
          select: {
            id: true,
            name: true,
            lastName: true,
          },
        },
      },
    });

    if (!note) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return note;
  });
