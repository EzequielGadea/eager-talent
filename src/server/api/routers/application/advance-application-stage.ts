import { headers } from "next/headers";

import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { auth } from "~/lib/auth";
import { parseStages } from "~/lib/validations/job-opening";
import { protectedProcedure } from "~/server/api/trpc";

export const advanceApplicationStage = protectedProcedure
  .input(
    z.object({
      applicantId: z.string(),
      jobOpeningId: z.string(),
      currentStageId: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const permission = await auth.api.hasPermission({
      headers: await headers(),
      body: {
        permissions: {
          application: ["update"],
        },
      },
    });

    if (!permission.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
      });
    }

    const [application, jobOpening] = await Promise.all([
      ctx.db.application.findUnique({
        where: {
          applicantId_jobOpeningId: {
            applicantId: input.applicantId,
            jobOpeningId: input.jobOpeningId,
          },
          deletedAt: null,
        },
        select: {
          applicantId: true,
          jobOpeningId: true,
          currentStageId: true,
          active: true,
        },
      }),

      ctx.db.jobOpening.findUnique({
        where: {
          id: input.jobOpeningId,
        },
        select: {
          id: true,
          stages: true,
        },
      }),
    ]);

    if (!application) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Application not found",
      });
    }

    if (!application.active) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Application is not active",
      });
    }

    if (!jobOpening) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Job opening not found",
      });
    }

    if (application.currentStageId !== input.currentStageId) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Application stage has changed",
      });
    }

    const stages = parseStages(jobOpening.stages);

    const stageIndex = stages.findIndex(
      (stage) => stage.key === input.currentStageId,
    );

    if (stageIndex === -1) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Current stage was not found",
      });
    }

    const currentStage = stages[stageIndex]!;
    const nextStage = stages[stageIndex + 1];

    if (!nextStage) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Application is already in the last stage",
      });
    }

    return ctx.db.$transaction(async (tx) => {
      // Conditional update: only succeeds if the application is still active
      // and still in the stage we read, so the activity logs the real change.
      const { count } = await tx.application.updateMany({
        where: {
          applicantId: input.applicantId,
          jobOpeningId: input.jobOpeningId,
          currentStageId: input.currentStageId,
          active: true,
        },
        data: {
          currentStageId: nextStage.key,
          stageEntryDate: new Date(),
        },
      });

      if (count !== 1) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Application stage has changed",
        });
      }

      await tx.activity.create({
        data: {
          applicantId: input.applicantId,
          jobOpeningId: input.jobOpeningId,
          createdById: ctx.session.user.id,
          description: `movió la postulación de "${currentStage.name}" a "${nextStage.name}"`,
        },
      });

      return {
        applicantId: input.applicantId,
        jobOpeningId: input.jobOpeningId,
        currentStageId: nextStage.key,
      };
    });
  });
