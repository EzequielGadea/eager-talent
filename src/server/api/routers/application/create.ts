import z from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { SalaryCurrency } from "~/generated/prisma/browser";
import { TRPCError } from "@trpc/server";
import { auth } from "~/lib/auth";

export const createApplicationProcedure = protectedProcedure
  .input(
    z.object({
      applicantId: z.string({ error: "Debe elegir un candidato ." }),
      jobOpeningId: z.string({ error: "Debe elegir una vacante." }),
      desiredSalary: z
        .number({ error: "El salario deseado debe ser un numero." })
        .positive({ error: "El salario debe ser positivo." }),
      currency: z.enum(SalaryCurrency, { error: "La moneda no es valida." }),
      availability: z
        .string({
          error:
            "Debe proveer una descripcion de cuando estara disponible para trabajar si se lo contrata.",
        })
        .min(1, "La descripcion de su disponibilidad es muy corta."),
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
