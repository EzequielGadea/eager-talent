import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { protectedProcedure } from "~/server/api/trpc";
import { getCandidateById } from "~/server/logic/candidate-service";

export const getCandidateByIdProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string().min(1),
    }),
  )
  .query(async ({ input, ctx }) => {
    const candidate = await getCandidateById(input.id, ctx.session.user.id);

    if (!candidate) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Candidato no encontrado",
      });
    }

    return candidate;
  });
