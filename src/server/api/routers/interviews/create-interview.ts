import { headers } from "next/headers";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { InterviewType } from "~/generated/prisma/enums";
import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";
import { stageAllowsInterview } from "~/lib/interview-stages";

export const createInterviewProcedure = protectedProcedure
  .input(
    z.object({
      applicantId: z.string(),
      jobOpeningId: z.string().optional(),
      name: z.string().trim().min(1, "El nombre es obligatorio."),
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

      const stages = Array.isArray(jobOpening?.stages) ? jobOpening.stages : [];
      const currentStageData = stages.find(
        (stage) =>
          typeof stage === "object" &&
          stage !== null &&
          "name" in stage &&
          stage.name === application.currentStage,
      );

      const currentStageType =
        currentStageData &&
        typeof currentStageData === "object" &&
        "type" in currentStageData &&
        typeof currentStageData.type === "string"
          ? currentStageData.type
          : "";

      if (!stageAllowsInterview(currentStageType)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Esta etapa no permite agendar entrevistas",
        });
      }
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
          description: `Entrevista agendada: "${input.name}"`,
        },
      }),
    ]);

    return interview;
  });
