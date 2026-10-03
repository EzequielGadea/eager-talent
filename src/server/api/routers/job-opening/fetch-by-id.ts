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
        hasBeenOpened: true,
        stages: true,
        location: true,
        openingDate: true,
        targetClosingDate: true,
        area: {
          select: {
            id: true,
            name: true,
          },
        },
        seniorities: {
          select: {
            id: true,
            name: true,
          },
        },
        hiringManagers: {
          select: {
            id: true,
            name: true,
            lastName: true,
            image: true,
            _count: {
              select: {
                assignedJobOpenings: true,
              },
            },
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
      hasBeenOpened: jobOpening.hasBeenOpened,
      stages: jobOpening.stages,
      location: jobOpening.location,
      openingDate: jobOpening.openingDate,
      targetClosingDate: jobOpening.targetClosingDate,
      area: jobOpening.area,
      seniorities: jobOpening.seniorities,
      hiringManagers: jobOpening.hiringManagers.map((hiringManager) => ({
        id: hiringManager.id,
        name: hiringManager.name,
        lastName: hiringManager.lastName,
        image: hiringManager.image,
        jobOpeningCount: hiringManager._count.assignedJobOpenings,
      })),
    };
  });
