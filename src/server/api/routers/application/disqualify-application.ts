import { headers } from "next/headers";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { auth } from "~/lib/auth";
import { parseStages } from "~/lib/validations/job-opening";
import { protectedProcedure } from "~/server/api/trpc";

export const disqualifyApplication = protectedProcedure
  .input(
    z.object({
      applicantId: z.string(),
      jobOpeningId: z.string(),
      reason: z.string().trim().min(1, "Ingresá un motivo."),
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
      },
      select: {
        active: true,
        currentStageId: true,
        jobOpening: { select: { stages: true } },
      },
    });

    if (!application) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    if (!application.active) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "La postulación ya está inactiva",
      });
    }

    const currentStageName =
      parseStages(application.jobOpening.stages).find(
        (stage) => stage.key === application.currentStageId,
      )?.name ?? application.currentStageId;

    return ctx.db.$transaction(async (tx) => {
      // Conditional update: only succeeds if the application is still active
      // and still in the stage we read, so the activity logs the real stage.
      const { count } = await tx.application.updateMany({
        where: {
          applicantId: input.applicantId,
          jobOpeningId: input.jobOpeningId,
          currentStageId: application.currentStageId,
          active: true,
        },
        data: {
          active: false,
          disqualificationDate: new Date(),
          disqualificationDescription: input.reason,
        },
      });

      if (count !== 1) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "La postulación fue modificada. Recargá e intentá de nuevo.",
        });
      }

      await tx.activity.create({
        data: {
          applicantId: input.applicantId,
          jobOpeningId: input.jobOpeningId,
          createdById: ctx.session.user.id,
          description: `descalificó la postulación desde "${currentStageName}": ${input.reason}`,
        },
      });

      return {
        applicantId: input.applicantId,
        jobOpeningId: input.jobOpeningId,
        active: false,
      };
    });
  });
