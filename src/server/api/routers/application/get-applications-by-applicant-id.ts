import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

export const getApplicationsByApplicantIdProcedure = protectedProcedure
  .input(
    z.object({
      applicantId: z.string().min(1),
    }),
  )
  .query(async ({ input, ctx }) => {
    const canReadAllResult = await auth.api.hasPermission({
      headers: ctx.headers,
      body: { permissions: { application: ["read"] } },
    });
    const canReadAssignedResult = await auth.api.hasPermission({
      headers: ctx.headers,
      body: { permissions: { application: ["readAssigned"] } },
    });

    if (!canReadAllResult.success && !canReadAssignedResult.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tenés permiso para consultar postulaciones",
      });
    }

    const applications = await ctx.db.application.findMany({
      where: {
        applicantId: input.applicantId,
        ...(canReadAllResult.success
          ? {}
          : {
              jobOpening: {
                hiringManagers: { some: { id: ctx.session.user.id } },
              },
            }),
      },
      orderBy: {
        applicationDate: "desc",
      },
      select: {
        applicantId: true,
        jobOpeningId: true,
        applicationDate: true,
        active: true,
        currentStage: true,
        desiredSalaryAmount: true,
        desiredSalaryCurrency: true,
        availability: true,
        jobOpening: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return applications.map((application) => ({
      ...application,
      desiredSalaryAmount: application.desiredSalaryAmount?.toString() ?? null,
    }));
  });
