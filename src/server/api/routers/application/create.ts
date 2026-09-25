import z from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { SalaryCurrency } from "~/generated/prisma/browser";
import { TRPCError } from "@trpc/server";
import { auth } from "~/lib/auth";

export const createApplicationProcedure = protectedProcedure
  .input(
    z.object({
      applicantId: z.string().min(1),
      jobOpeningId: z.string(),
      desiredSalary: z.number().positive().or(z.literal("")),
      currency: z.union([z.enum(SalaryCurrency)]),
      availability: z.string(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const canCreateResult = await auth.api.hasPermission({
      headers: ctx.headers,
      body: { permissions: { application: ["create"] } },
    });

    if (!canCreateResult.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tenés permiso para crear postulaciones",
      });
    }

    const jobOpening = await ctx.db.jobOpening.findUnique({
      where: { id: input.jobOpeningId },
    });

    if (!jobOpening) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Vacante no encontrada.",
      });
    }

    const existingApplication = await ctx.db.application.findFirst({
      where: {
        applicantId: input.applicantId,
        jobOpeningId: input.jobOpeningId,
      },
    });

    if (existingApplication) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "El postulante ya tiene una postulación para esta vacante",
      });
    }

    const stages = jobOpening.stages as Array<{ name: string }>;

    const application = await ctx.db.application.create({
      data: {
        applicantId: input.applicantId,
        jobOpeningId: input.jobOpeningId,
        desiredSalaryAmount: input.desiredSalary,
        desiredSalaryCurrency: input.currency,
        availability: input.availability,
        currentStage: stages[0]?.name,
      },
    });

    return application;
  });
