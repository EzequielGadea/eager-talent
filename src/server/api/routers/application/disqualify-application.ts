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

    return ctx.db.$transaction(async (tx) => {
      const updated = await tx.application.update({
        where: {
          applicantId_jobOpeningId: {
            applicantId: input.applicantId,
            jobOpeningId: input.jobOpeningId,
          },
        },
        data: {
          active: false,
          disqualificationDate: new Date(),
          disqualificationReason: input.reason,
        },
        select: { applicantId: true, jobOpeningId: true, active: true },
      });

      await tx.activity.create({
        data: {
          applicantId: input.applicantId,
          jobOpeningId: input.jobOpeningId,
          description: `Descalificado desde "${application.currentStage}": ${input.reason}`,
        },
      });

      return updated;
    });
  });
