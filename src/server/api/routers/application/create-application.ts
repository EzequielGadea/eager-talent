import { headers } from "next/headers";
import { z } from "zod";

import { TRPCError } from "@trpc/server";

import { SalaryCurrency } from "~/generated/prisma/enums";
import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

export const createApplication = protectedProcedure
  .input(
    z
      .object({
        applicantId: z.string(),
        jobOpeningId: z.string(),
        desiredSalaryAmount: z.number().positive().optional(),
        desiredSalaryCurrency: z.enum(SalaryCurrency).optional(),
        availability: z.string().trim().optional(),
      })
      .superRefine((data, ctx) => {
        if (
          data.desiredSalaryAmount !== undefined &&
          data.desiredSalaryCurrency === undefined
        ) {
          ctx.addIssue({
            code: "custom",
            path: ["desiredSalaryCurrency"],
            message: "Debe seleccionar una moneda",
          });
        }

        if (
          data.desiredSalaryCurrency !== undefined &&
          data.desiredSalaryAmount === undefined
        ) {
          ctx.addIssue({
            code: "custom",
            path: ["desiredSalaryAmount"],
            message: "Debe ingresar el salario deseado",
          });
        }
      }),
  )
  .mutation(async ({ ctx, input }) => {
    const permission = await auth.api.hasPermission({
      headers: await headers(),
      body: {
        permissions: {
          application: ["create"],
        },
      },
    });

    if (!permission.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
      });
    }

    const [applicant, jobOpening] = await Promise.all([
      ctx.db.applicant.findUnique({
        where: {
          id: input.applicantId,
        },
        select: {
          id: true,
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

    if (!applicant) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Applicant not found",
      });
    }

    if (!jobOpening) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Job opening not found",
      });
    }

    const existingApplication = await ctx.db.application.findUnique({
      where: {
        applicantId_jobOpeningId: {
          applicantId: input.applicantId,
          jobOpeningId: input.jobOpeningId,
        },
      },
      select: {
        applicantId: true,
      },
    });

    if (existingApplication) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Applicant is already assigned to this job opening",
      });
    }

    const firstStage = Array.isArray(jobOpening.stages)
      ? jobOpening.stages[0]
      : undefined;

    if (
      typeof firstStage !== "object" ||
      firstStage === null ||
      Array.isArray(firstStage) ||
      !("name" in firstStage) ||
      typeof firstStage.name !== "string" ||
      firstStage.name.trim() === ""
    ) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Job opening has an invalid first stage",
      });
    }
    const now = new Date();
    try {
      return await ctx.db.application.create({
        data: {
            applicantId: input.applicantId,
            jobOpeningId: input.jobOpeningId,
            applicationDate: now,
            currentStage: firstStage.name,
            active: true,
            stageEntryDate: now,
            desiredSalaryAmount: input.desiredSalaryAmount,
            desiredSalaryCurrency: input.desiredSalaryCurrency,
            availability: input.availability,
        },
        select: {
            applicantId: true,
            jobOpeningId: true,
            currentStage: true,
        },
    });
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002"
      ) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Applicant is already assigned to this job opening",
        });
      }

      throw error;
    }
  });