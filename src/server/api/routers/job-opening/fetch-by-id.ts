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
          jobOpening: ["read"],
        },
      },
    });

    const canReadAssigned = await auth.api.hasPermission({
      headers: ctx.headers,
      body: {
        permissions: {
          jobOpening: ["readAssigned"],
        },
      },
    });

    if (!canReadAll.success && !canReadAssigned.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tienes permiso para consultar esta vacante",
      });
    }

    const jobOpening = await ctx.db.jobOpening.findUnique({
      where: {
        id: input.id,
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
        hiringManagers: {
          select: {
            id: true,
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

    if (
      !canReadAll.success &&
      !jobOpening.hiringManagers.some(
        (hiringManager) => hiringManager.id === ctx.session.user.id,
      )
    ) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tienes permiso para consultar esta vacante",
      });
    }

    return {
      id: jobOpening.id,
      name: jobOpening.name,
      status: jobOpening.status,
      stages: jobOpening.stages,
      openingDate: jobOpening.openingDate,
      area: jobOpening.area,
    };
  });
