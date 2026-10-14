import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";

import { auth } from "~/lib/auth";
import { getInterviewName } from "~/lib/validations/interview-stages";
import { protectedProcedure } from "~/server/api/trpc";

export const deleteInterviewProcedure = protectedProcedure
  .input(
    z.object({
      interviewId: z.string().min(1),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const permission = await auth.api.hasPermission({
      headers: ctx.headers,
      body: { permissions: { interview: ["delete"] } },
    });

    if (!permission.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tenés permiso para eliminar entrevistas",
      });
    }

    const interview = await ctx.db.interview.findUnique({
      where: { id: input.interviewId },
      select: {
        id: true,
        exploratoryName: true,
        stageId: true,
        date: true,
        applicantId: true,
        jobOpeningId: true,
        application: {
          select: { jobOpening: { select: { stages: true } } },
        },
      },
    });

    if (!interview) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Entrevista no encontrada",
      });
    }

    const interviewName = getInterviewName(
      interview,
      interview.application?.jobOpening.stages,
    );

    await ctx.db.$transaction([
      ctx.db.interview.delete({
        where: { id: interview.id },
      }),
      ctx.db.activity.create({
        data: {
          applicantId: interview.applicantId,
          jobOpeningId: interview.jobOpeningId,
          createdById: ctx.session.user.id,
          description: interview.date
            ? `eliminó la entrevista "${interviewName}" del ${format(new TZDate(interview.date, "America/Montevideo"), "dd/MM/yyyy 'a las' HH:mm")}`
            : `eliminó la entrevista "${interviewName}"`,
        },
      }),
    ]);

    return { id: interview.id };
  });
