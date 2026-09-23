import { headers } from "next/headers";

import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

export const advanceApplicationStage = protectedProcedure
  .input(
    z.object({
      applicantId: z.string(),
      jobOpeningId: z.string(),
      currentStage: z.string(),
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

    if (application.currentStage !== input.currentStage) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Application stage has changed",
      });
    }

    const stages = Array.isArray(jobOpening.stages)
      ? jobOpening.stages
      : [];

    const stageIndex = stages.findIndex(
      (stage) =>
        typeof stage === "object" &&
        stage !== null &&
        !Array.isArray(stage) &&
        "name" in stage &&
        typeof stage.name === "string" &&
        stage.name === input.currentStage,
    );

    if (stageIndex === -1) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Current stage was not found",
      });
    }

    const nextStage = stages[stageIndex + 1];

    if (
      typeof nextStage !== "object" ||
      nextStage === null ||
      Array.isArray(nextStage) ||
      !("name" in nextStage) ||
      typeof nextStage.name !== "string" ||
      nextStage.name.trim() === ""
    ) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Application is already in the last stage",
      });
    }

    return ctx.db.application.update({
      where: {
        applicantId_jobOpeningId: {
          applicantId: input.applicantId,
          jobOpeningId: input.jobOpeningId,
        },
      },
      data: {
        currentStage: nextStage.name,
        stageEntryDate: new Date(),
      },
      select: {
        applicantId: true,
        jobOpeningId: true,
        currentStage: true,
      },
    });
  });