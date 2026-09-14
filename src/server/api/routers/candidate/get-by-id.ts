import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { candidateUserProcedure } from "~/server/api/procedures/candidate-user";

export const getCandidateByIdProcedure = candidateUserProcedure
  .input(
    z.object({
      id: z.string().min(1),
    }),
  )
  .query(async ({ input, ctx }) => {
    const candidate = await ctx.db.applicant.findFirst({
      where: { id: input.id, ...ctx.candidateAccessWhere },
      include: {
        role: { select: { name: true } },
        area: { select: { name: true } },
        seniority: { select: { name: true, color: true } },
        tags: { select: { id: true, name: true, color: true, isSkill: true } },
      },
    });

    if (!candidate) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Candidato no encontrado",
      });
    }

    return { ...candidate, permissions: ctx.candidatePermissions };
  });
