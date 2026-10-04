import { headers } from "next/headers";

import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

export const moveApplicationToStage = protectedProcedure
  .input(
    z.object({
      applicantId: z.string(),
      jobOpeningId: z.string(),
      targetStage: z.string(),
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
        message: "User does not have application:update permission",
      });
    }

    const [application, jobOpening] = await Promise.all([
      ctx.db.application.findUnique({
        where: {
          applicantId_jobOpeningId: {
            applicantId: input.applicantId,
            jobOpeningId: input.jobOpeningId,
          },
        },
        select: {
          applicantId: true,
          jobOpeningId: true,
          currentStage: true,
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

    const stages = Array.isArray(jobOpening.stages) ? jobOpening.stages : [];

    const targetStageExists = stages.some(
      (stage) =>
        typeof stage === "object" &&
        stage !== null &&
        !Array.isArray(stage) &&
        "name" in stage &&
        typeof stage.name === "string" &&
        stage.name === input.targetStage,
    );

    if (!targetStageExists) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Target stage was not found",
      });
    }

    if (application.currentStage === input.targetStage) {
      return application;
    }

    const fromStage = application.currentStage;

    return ctx.db.$transaction(async (tx) => {
      // Conditional update: only succeeds if the application is still active
      // and still in the stage we read, so the activity logs the real change.
      const { count } = await tx.application.updateMany({
        where: {
          applicantId: input.applicantId,
          jobOpeningId: input.jobOpeningId,
          currentStage: fromStage,
          active: true,
        },
        data: {
          currentStage: input.targetStage,
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
          description: `movió la postulación de "${fromStage}" a "${input.targetStage}"`,
        },
      });

      return {
        applicantId: input.applicantId,
        jobOpeningId: input.jobOpeningId,
        currentStage: input.targetStage,
      };
    });
  });
