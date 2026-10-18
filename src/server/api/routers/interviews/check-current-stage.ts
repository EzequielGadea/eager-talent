import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

export const checkInterviewCurrentStageProcedure = protectedProcedure
  .input(
    z.object({
      interviewId: z.string().min(1),
    }),
  )
  .query(async ({ input, ctx }) => {
    const permission = await auth.api.hasPermission({
      headers: ctx.headers,
      body: { permissions: { application: ["update"] } },
    });

    if (!permission.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tenés permiso para actualizar postulaciones",
      });
    }

    const interview = await ctx.db.interview.findUnique({
      where: { id: input.interviewId },
      select: {
        id: true,
        stageId: true,
        applicantId: true,
        jobOpeningId: true,
        application: {
          select: {
            applicantId: true,
            jobOpeningId: true,
            active: true,
            currentStageId: true,
          },
        },
      },
    });

    if (!interview) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Entrevista no encontrada",
      });
    }

    const application = interview.application;
    const isCurrentStage =
      application?.active === true &&
      interview.stageId !== null &&
      interview.stageId === application.currentStageId;

    return {
      isCurrentStage,
      applicantId: application?.applicantId ?? interview.applicantId,
      jobOpeningId: application?.jobOpeningId ?? interview.jobOpeningId,
      currentStageId: application?.currentStageId ?? interview.stageId,
    };
  });
