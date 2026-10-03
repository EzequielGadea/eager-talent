import { headers } from "next/headers";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";

import { InterviewType } from "~/generated/prisma/enums";
import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";
import { parseStages, stageAllowsInterview } from "~/lib/interview-stages";

export const createInterviewProcedure = protectedProcedure
  .input(
    z.object({
      applicantId: z.string(),
      jobOpeningId: z.string().optional(),
      name: z.string().trim().min(1, "El nombre es obligatorio."),
      duration: z.number().int().positive(),
      modality: z.enum(InterviewType),
      date: z.coerce.date().refine((d) => d.getTime() > Date.now(), {
        message: "La fecha y hora de la entrevista deben ser futuras.",
      }),
      interviewerIds: z
        .array(z.string())
        .min(1, "Seleccioná al menos un entrevistador."),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const permission = await auth.api.hasPermission({
      headers: await headers(),
      body: { permissions: { interview: ["create"] } },
    });

    if (!permission.success) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const applicant = await ctx.db.applicant.findUnique({
      where: { id: input.applicantId },
      select: { id: true },
    });

    if (!applicant) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Applicant not found",
      });
    }

    if (input.jobOpeningId) {
      const application = await ctx.db.application.findUnique({
        where: {
          applicantId_jobOpeningId: {
            applicantId: input.applicantId,
            jobOpeningId: input.jobOpeningId,
          },
        },
        select: { applicantId: true, currentStage: true },
      });

      if (!application) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }

      const jobOpening = await ctx.db.jobOpening.findUnique({
        where: { id: input.jobOpeningId },
        select: { stages: true },
      });

      if (!jobOpening) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Job opening not found",
        });
      }

      const currentStage = parseStages(jobOpening.stages).find(
        (stage) => stage.name === application.currentStage,
      );

      if (!stageAllowsInterview(currentStage)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Esta etapa no permite agendar entrevistas",
        });
      }
    }

    const start = input.date;
    const end = new Date(start.getTime() + input.duration * 60_000);
    const MAX_INTERVIEW_MS = 24 * 60 * 60_000;

    const nearbyInterviews = await ctx.db.interview.findMany({
      where: {
        applicantId: input.applicantId,
        status: "Scheduled",
        date: {
          gt: new Date(start.getTime() - MAX_INTERVIEW_MS),
          lt: end,
        },
      },
      select: {
        date: true,
        duration: true,
      },
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

    const [interview] = await ctx.db.$transaction([
      ctx.db.interview.create({
        data: {
          name: input.name,
          duration: input.duration,
          modality: input.modality,
          date: input.date,
          status: "Scheduled",
          applicantId: input.applicantId,
          jobOpeningId: input.jobOpeningId,
          interviewers: {
            connect: input.interviewerIds.map((id) => ({ id })),
          },
        },
      }),
      ctx.db.activity.create({
        data: {
          applicantId: input.applicantId,
          jobOpeningId: input.jobOpeningId,
          createdById: ctx.session.user.id,
          description: `agendó la entrevista "${input.name}" el ${format(new TZDate(input.date, "America/Montevideo"), "dd/MM/yyyy 'a las' HH:mm")}`,
        },
      }),
    ]);

    return interview;
  });
