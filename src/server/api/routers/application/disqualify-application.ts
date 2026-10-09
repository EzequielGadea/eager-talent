import { headers } from "next/headers";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

export const disqualifyApplication = protectedProcedure
  .input(
    z.object({
      applicantId: z.string(),
      jobOpeningId: z.string(),
      motiveId: z.string().min(1, "Seleccioná un motivo."),
      description: z.string().trim().optional(),
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
      select: { active: true, currentStage: true },
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

    const motive = await ctx.db.disqualificationMotive.findUnique({
      where: { id: input.motiveId },
      select: { name: true },
    });

    if (!motive) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "El motivo seleccionado no existe",
      });
    }

    return ctx.db.$transaction(async (tx) => {
      // Conditional update: only succeeds if the application is still active
      // and still in the stage we read, so the activity logs the real stage.
      const { count } = await tx.application.updateMany({
        where: {
          applicantId: input.applicantId,
          jobOpeningId: input.jobOpeningId,
          currentStage: application.currentStage,
          active: true,
        },
        data: {
          active: false,
          disqualificationDate: new Date(),
          disqualificationMotiveId: input.motiveId,
          disqualificationDescription: input.description || null,
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
          description: `descalificó la postulación desde "${application.currentStage}": ${motive.name}${
            input.description ? ` (${input.description})` : ""
          }`,
        },
      });

      return {
        applicantId: input.applicantId,
        jobOpeningId: input.jobOpeningId,
        active: false,
      };
    });
  });
