import { headers } from "next/headers";

import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { auth } from "~/lib/auth";
import { getClosedStageError } from "~/lib/stage-metrics";
import { parseStages } from "~/lib/validations/job-opening";
import { protectedProcedure } from "~/server/api/trpc";

export const moveApplicationToStage = protectedProcedure
  .input(
    z.object({
      applicantId: z.string(),
      jobOpeningId: z.string(),
      targetStageId: z.string(),
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
        message: "No tenés permiso para mover postulaciones.",
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
        message: "No se encontró la postulación.",
      });
    }

    if (!application.active) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Esta postulación ya no está activa y no se puede mover.",
      });
    }

    if (!jobOpening) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No se encontró la vacante.",
      });
    }

    const stages = parseStages(jobOpening.stages);

    const targetStage = stages.find(
      (stage) => stage.key === input.targetStageId,
    );

    if (!targetStage) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No se encontró la etapa de destino.",
      });
    }

    if (application.currentStageId === input.targetStageId) {
      return application;
    }

    const closedStageError = getClosedStageError(targetStage);

    if (closedStageError) {
      throw new TRPCError({ code: "CONFLICT", message: closedStageError });
    }

    const fromStageId = application.currentStageId;
    const fromStageName =
      stages.find((stage) => stage.key === fromStageId)?.name ?? fromStageId;

    return ctx.db.$transaction(async (tx) => {
      // Conditional update: only succeeds if the application is still active
      // and still in the stage we read, so the activity logs the real change.
      const { count } = await tx.application.updateMany({
        where: {
          applicantId: input.applicantId,
          jobOpeningId: input.jobOpeningId,
          currentStageId: fromStageId,
          active: true,
        },
        data: {
          currentStageId: targetStage.key,
          stageEntryDate: new Date(),
        },
      });

      if (count !== 1) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "La etapa de la postulación cambió. Intentá nuevamente.",
        });
      }

      await tx.activity.create({
        data: {
          applicantId: input.applicantId,
          jobOpeningId: input.jobOpeningId,
          createdById: ctx.session.user.id,
          description: `movió la postulación de "${fromStageName}" a "${targetStage.name}"`,
        },
      });

      return {
        applicantId: input.applicantId,
        jobOpeningId: input.jobOpeningId,
        currentStageId: targetStage.key,
      };
    });
  });
