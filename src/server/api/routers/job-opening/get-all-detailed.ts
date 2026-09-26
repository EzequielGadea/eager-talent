import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { auth } from "~/lib/auth";
import { isHiringManagerAssignedToJobOpening } from "~/server/api/procedures/is-hiring-manager-assigned-to-job-opening";
import { protectedProcedure } from "~/server/api/trpc";

export const getAllJobOpeningsDetailed = protectedProcedure
  .input(
    z.object({
      page: z.number().int().min(1).default(1),
    }),
  )
  .query(async ({ ctx, input }) => {
    const [canReadAllResult, canReadAssignedResult] = await Promise.all([
      auth.api.hasPermission({
        headers: ctx.headers,
        body: { permissions: { jobOpening: ["read"] } },
      }),
      auth.api.hasPermission({
        headers: ctx.headers,
        body: { permissions: { jobOpening: ["readAssigned"] } },
      }),
    ]);

    if (!canReadAllResult.success && !canReadAssignedResult.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tenés permiso para consultar vacantes",
      });
    }

    const where = canReadAllResult.success
      ? {}
      : isHiringManagerAssignedToJobOpening(ctx.session.user.id);

    const jobOpenings = await ctx.db.jobOpening.findMany({
      where,

      skip: (input.page - 1) * 8,
      take: 8,

      select: {
        id: true,
        name: true,
        status: true,
        openingDate: true,

        area: {
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
          },
        },

        applications: {
          where: {
            active: true,
          },
          select: {
            currentStage: true,
          },
        },
      },

      orderBy: {
        openingDate: "desc",
      },
    });

   return jobOpenings.map((jobOpening) => {
      const {
        applications,
        ...jobOpeningData
      } = jobOpening;

      return {
        ...jobOpeningData,

        applicants: applications.length,

        technicalInterviewApplicants: applications.filter(
          (application) =>
            application.currentStage === "Entrevista Técnica",
        ).length,

        offeredApplicants: applications.filter(
          (application) =>
            application.currentStage === "Oferta",
        ).length,
      };
    });
  });
