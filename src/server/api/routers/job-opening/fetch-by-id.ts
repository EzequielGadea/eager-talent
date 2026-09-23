import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

export const fetchById = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .query(async ({ ctx, input }) => {
    const canReadAll = await auth.api.hasPermission({
      headers: ctx.headers,
      body: {
        permissions: {
          application: ["read"],
        },
      },
    });

    const canReadAssigned = await auth.api.hasPermission({
      headers: ctx.headers,
      body: {
        permissions: {
          application: ["readAssigned"],
        },
      },
    });

    if (!canReadAll.success && !canReadAssigned.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tienes permiso para consultar esta vacante",
      });
    }

    const jobOpening = await ctx.db.jobOpening.findFirst({
      where: {
        id: input.id,
        ...(canReadAll.success
          ? {}
          : {
              hiringManagers: {
                some: {
                  id: ctx.session.user.id,
                },
              },
            }),
      },
      select: {
        id: true,
        name: true,
        status: true,
        stages: true,
        openingDate: true,
        area: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!jobOpening) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Vacante no encontrada",
      });
    }

    return jobOpening;
  });
