import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";
import { getApplicantByKeywordWhere } from "~/server/api/procedures/get-applicant-search-where";

export const fetchDisqualifiedApplications = protectedProcedure
  .input(
    z.object({
      jobOpeningId: z.string(),
      search: z.string().optional(),
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
        deletedAt: null,
        active: false,
        disqualificationDate: { not: null },
        applicant: getApplicantByKeywordWhere(input.search),
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
        currentStageId: true,
        disqualificationDate: true,
        disqualificationDescription: true,
        disqualificationMotive: {
          select: { name: true },
        },
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
      stage: application.currentStageId,
      disqualificationDate: application.disqualificationDate!,
      disqualificationMotive: application.disqualificationMotive?.name ?? null,
      disqualificationDescription: application.disqualificationDescription,
      name: application.applicant.name,
      lastName: application.applicant.lastName,
      photo: application.applicant.photo,
      role: application.applicant.role.name,
    }));
  });
