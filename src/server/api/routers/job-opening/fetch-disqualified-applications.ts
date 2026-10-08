import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

export const fetchDisqualifiedApplications = protectedProcedure
  .input(
    z.object({
      jobOpeningId: z.string(),
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
        message:
          "No tienes permiso para consultar las postulaciones descalificadas",
      });
    }

    const applications = await ctx.db.application.findMany({
      where: {
        jobOpeningId: input.jobOpeningId,
        active: false,
        disqualificationDate: { not: null },
        ...(canReadAll.success
          ? {}
          : {
              jobOpening: {
                hiringManagers: {
                  some: {
                    id: ctx.session.user.id,
                  },
                },
              },
            }),
      },
      orderBy: [
        {
          disqualificationDate: "desc",
        },
        {
          applicantId: "asc",
        },
      ],
      select: {
        applicantId: true,
        currentStage: true,
        disqualificationDate: true,
        disqualificationReason: true,
        applicant: {
          select: {
            name: true,
            lastName: true,
            photo: true,
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return applications.map((application) => ({
      applicantId: application.applicantId,
      stage: application.currentStage,
      disqualificationDate: application.disqualificationDate!,
      disqualificationReason: application.disqualificationReason,
      name: application.applicant.name,
      lastName: application.applicant.lastName,
      photo: application.applicant.photo,
      role: application.applicant.role.name,
    }));
  });
