import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

export const getAllJobOpenings = protectedProcedure
  .input(
    z.object({
      applicantId: z.string().min(1).optional(),
    }),
  )
  .query(async ({ ctx, input }) => {
    if (input.applicantId) {
      const canCreateResult = await auth.api.hasPermission({
        headers: ctx.headers,
        body: { permissions: { application: ["create"] } },
      });

      if (!canCreateResult.success) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No tenés permiso para crear postulaciones",
        });
      }
    }

    const jobOpenings = await ctx.db.jobOpening.findMany({
      where: input.applicantId
        ? {
            applications: {
              none: { applicantId: input.applicantId },
            },
          }
        : undefined,
      select: { id: true, name: true },
    });

    if (!jobOpenings) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return jobOpenings;
  });
