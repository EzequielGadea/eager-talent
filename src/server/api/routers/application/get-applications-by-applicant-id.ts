import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { auth } from "~/lib/auth";
import {
  parseStages,
  stageAllowsInterview,
} from "~/lib/validations/job-opening";
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
        deletedAt: null,
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
        currentStageId: true,
        disqualificationDescription: true,
        desiredSalaryAmount: true,
        desiredSalaryCurrency: true,
        availability: true,
        jobOpening: {
          select: {
            id: true,
            name: true,
            status: true,
            stages: true,
          },
        },
      },
    });

    return applications.map(({ jobOpening, ...application }) => {
      const currentStage = parseStages(jobOpening.stages).find(
        (stage) => stage.key === application.currentStageId,
      );

      return {
        ...application,
        currentStageName: currentStage?.name ?? application.currentStageId,
        canScheduleInterview: stageAllowsInterview(currentStage),
        jobOpening: {
          id: jobOpening.id,
          name: jobOpening.name,
          status: jobOpening.status,
        },
        desiredSalaryAmount:
          application.desiredSalaryAmount?.toString() ?? null,
      };
    });
  });
