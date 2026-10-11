import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { InterviewType } from "~/generated/prisma/enums";
import { auth } from "~/lib/auth";
import { getInterviewName } from "~/lib/get-interview-name";
import { protectedProcedure } from "~/server/api/trpc";

const MAX_INTERVIEW_MS = 24 * 60 * 60_000;

export const updateInterviewProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string().min(1),
      exploratoryName: z.string().trim().min(1).optional(),
      duration: z.number().int().positive(),
      modality: z.enum(InterviewType),
      date: z.coerce.date(),
      interviewerIds: z
        .array(z.string())
        .min(1, "Seleccioná al menos un entrevistador."),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const permission = await auth.api.hasPermission({
      headers: ctx.headers,
      body: { permissions: { interview: ["update"] } },
    });

    if (!permission.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tenés permiso para editar entrevistas",
      });
    }

    const interview = await ctx.db.interview.findUnique({
      where: { id: input.id },
      select: {
        id: true,
        date: true,
        status: true,
        applicantId: true,
        jobOpeningId: true,
        stageId: true,
        application: {
          select: { jobOpening: { select: { stages: true } } },
        },
        interviewers: { select: { id: true } },
      },
    });

    if (!interview) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Entrevista no encontrada",
      });
    }

    if (interview.jobOpeningId && input.exploratoryName !== undefined) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Solo las entrevistas exploratorias pueden cambiar de nombre",
      });
    }

    if (!interview.jobOpeningId && !input.exploratoryName?.trim()) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "El nombre es obligatorio para una entrevista exploratoria",
      });
    }

    if (interview.status === "Scheduled") {
      const start = input.date;
      const end = new Date(start.getTime() + input.duration * 60_000);

      const nearbyInterviews = await ctx.db.interview.findMany({
        where: {
          id: { not: interview.id },
          applicantId: interview.applicantId,
          status: "Scheduled",
          date: {
            gt: new Date(start.getTime() - MAX_INTERVIEW_MS),
            lt: end,
          },
        },
        select: { date: true, duration: true },
      });

      const hasOverlap = nearbyInterviews.some((existing) => {
        if (!existing.date) return false;

        const existingStart = existing.date.getTime();
        const existingEnd = existingStart + existing.duration * 60_000;

        return existingStart < end.getTime() && existingEnd > start.getTime();
      });

      if (hasOverlap) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "El candidato ya tiene una entrevista en ese horario.",
        });
      }
    }

    const currentInterviewerIds = new Set(
      interview.interviewers.map(({ id }) => id),
    );
    const addedInterviewerIds = input.interviewerIds.filter(
      (id) => !currentInterviewerIds.has(id),
    );
    const interviewName = getInterviewName(
      {
        exploratoryName: interview.jobOpeningId
          ? null
          : (input.exploratoryName?.trim() ?? null),
        stageId: interview.stageId,
      },
      interview.application?.jobOpening.stages,
    );

    await ctx.db.$transaction([
      ctx.db.interview.update({
        where: { id: interview.id },
        data: {
          ...(interview.jobOpeningId
            ? {}
            : { exploratoryName: input.exploratoryName!.trim() }),
          duration: input.duration,
          modality: input.modality,
          date: input.date,
          interviewers: {
            set: input.interviewerIds.map((id) => ({ id })),
          },
          assignments: {
            deleteMany: { interviewerId: { notIn: input.interviewerIds } },
            // Kept interviewers retain their original assigner.
            create: addedInterviewerIds.map((interviewerId) => ({
              interviewer: { connect: { id: interviewerId } },
              assignedBy: { connect: { id: ctx.session.user.id } },
            })),
          },
        },
      }),
      ctx.db.activity.create({
        data: {
          applicantId: interview.applicantId,
          jobOpeningId: interview.jobOpeningId,
          createdById: ctx.session.user.id,
          description: `editó la entrevista "${interviewName}"`,
        },
      }),
    ]);

    return { id: interview.id };
  });
