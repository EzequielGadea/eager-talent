import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { JobOpeningStatus } from "~/generated/prisma/enums";
import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

export const getAllOpenJobOpenings = protectedProcedure
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

    return ctx.db.jobOpening.findMany({
      where: {
        status: JobOpeningStatus.Open,
        ...(input.applicantId && {
          applications: {
            none: { applicantId: input.applicantId },
          },
        }),
      },
      select: { id: true, name: true },
    });
  });
