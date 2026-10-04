import z from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { SalaryCurrency } from "~/generated/prisma/browser";
import { JobOpeningStatus } from "~/generated/prisma/enums";
import { TRPCError } from "@trpc/server";
import { auth } from "~/lib/auth";

export const createApplicationProcedure = protectedProcedure
  .input(
    z
      .object({
        applicantId: z.string({ error: "Debe elegir un candidato ." }),
        jobOpeningId: z.string({ error: "Debe elegir una vacante." }),
        desiredSalary: z.number().positive().optional(),
        currency: z.enum(SalaryCurrency).optional(),
        availability: z
          .string({
            error:
              "Debe proveer una descripcion de cuando estara disponible para trabajar si se lo contrata.",
          })
          .trim()
          .min(1, "La descripcion de su disponibilidad es muy corta."),
      })
      .superRefine((data, ctx) => {
        if (data.desiredSalary !== undefined && data.currency === undefined) {
          ctx.addIssue({
            code: "custom",
            path: ["currency"],
            message: "Debe elegir una moneda.",
          });
        }

        if (data.currency !== undefined && data.desiredSalary === undefined) {
          ctx.addIssue({
            code: "custom",
            path: ["desiredSalary"],
            message: "Debe indicar el salario deseado.",
          });
        }
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
      select: { stages: true, status: true },
    });

    if (!jobOpening) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Vacante no encontrada.",
      });
    }

    if (jobOpening.status !== JobOpeningStatus.Open) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Solo se puede postular a vacantes abiertas.",
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
