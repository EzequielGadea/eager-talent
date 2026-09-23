import { headers } from "next/headers";
import { z } from "zod";

import { TRPCError } from "@trpc/server";

import { JobOpeningStatus } from "~/generated/prisma/enums";
import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

export const updateStatus = protectedProcedure
  .input(
    z.object({
      jobOpeningId: z.string(),
      status: z.enum(JobOpeningStatus),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const permission = await auth.api.hasPermission({
      headers: await headers(),
      body: {
        permissions: {
          jobOpening: ["update"],
        },
      },
    });

    if (!permission.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tienes permiso para modificar la vacante",
      });
    }

    const jobOpening = await ctx.db.jobOpening.findUnique({
      where: {
        id: input.jobOpeningId,
      },
      select: {
        id: true,
      },
    });

    if (!jobOpening) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Job opening not found",
      });
    }

    return ctx.db.jobOpening.update({
      where: {
        id: input.jobOpeningId,
      },
      data: {
        status: input.status,
      },
      select: {
        id: true,
        status: true,
      },
    });
  });