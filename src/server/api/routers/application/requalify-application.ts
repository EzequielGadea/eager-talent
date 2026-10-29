import { headers } from "next/headers";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { JobOpeningStatus } from "~/generated/prisma/enums";
import { parseStages } from "~/lib/validations/job-opening";
import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

export const requalifyApplication = protectedProcedure
  .input(
    z.object({
      applicantId: z.string(),
      jobOpeningId: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const permission = await auth.api.hasPermission({
      headers: await headers(),
      body: { permissions: { application: ["update"] } },
    });

    if (!permission.success) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const application = await ctx.db.application.findUnique({
      where: {
        applicantId_jobOpeningId: {
          applicantId: input.applicantId,
          jobOpeningId: input.jobOpeningId,
        },
        deletedAt: null,
      },
      select: {
        active: true,
        currentStageId: true,
        jobOpening: { select: { status: true, stages: true } },
      },
    });

    if (!application) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    if (application.active) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "La postulación no está descalificada",
      });
    }

    if (application.jobOpening.status !== JobOpeningStatus.Open) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message:
          "No se puede recalificar un candidato en una vacante que no está abierta",
      });
    }

    return ctx.db.$transaction(async (tx) => {
      const { count } = await tx.application.updateMany({
        where: {
          applicantId: input.applicantId,
          jobOpeningId: input.jobOpeningId,
          currentStageId: application.currentStageId,
          active: false,
          jobOpening: {
            status: JobOpeningStatus.Open,
          },
        },
        data: {
          active: true,
          disqualificationDate: null,
          disqualificationDescription: null,
          disqualificationMotiveId: null,
        },
      });

      if (count !== 1) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "La postulación fue modificada. Recargá e intentá de nuevo.",
        });
      }

      const currentStageName =
        parseStages(application.jobOpening.stages).find(
          (stage) => stage.key === application.currentStageId,
        )?.name ?? application.currentStageId;

      await tx.activity.create({
        data: {
          applicantId: input.applicantId,
          jobOpeningId: input.jobOpeningId,
          createdById: ctx.session.user.id,
          description: `volvió a calificar la postulación en "${currentStageName}"`,
        },
      });

      return {
        applicantId: input.applicantId,
        jobOpeningId: input.jobOpeningId,
        active: true,
      };
    });
  });
