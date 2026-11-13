import { z } from "zod";
import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";
import { Prisma } from "~/generated/prisma/client";
import { JobOpeningStatus } from "~/generated/prisma/enums";
import { TRPCError } from "@trpc/server";
import { persistedStagesSchema } from "~/lib/validations/job-opening";
import {
  getRequiredStageErrors,
  getRequiredStageTypeErrors,
} from "~/lib/validations/required-stages";

export const createJobOpening = protectedProcedure
  .input(
    z.object({
      name: z.string().min(1),
      area: z.string().min(1),
      status: z.enum(JobOpeningStatus),
      seniorityIds: z.array(z.string()).default([]),
      hiringManagerIds: z.array(z.string()).default([]),
      location: z.string(),
      openingDate: z.coerce.date(),
      closingDate: z.coerce.date(),
      stages: persistedStagesSchema.superRefine((stages) => {
        const errors = [
          ...getRequiredStageErrors(stages),
          ...getRequiredStageTypeErrors(stages),
        ];

        if (errors.length) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No se cumplen las etapas minimas para la vacante",
          });
        }
      }),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const permission = await auth.api.hasPermission({
      headers: ctx.headers,
      body: {
        permissions: {
          jobOpening: ["create"],
        },
      },
    });

    if (!permission.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "FORBIDDEN",
      });
    }
    if (
      input.status === JobOpeningStatus.Closed &&
      input.openingDate > new Date()
    ) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No se puede cerrar una vacante antes de su fecha de inicio",
      });
    }

    const organizationId = ctx.session.session.activeOrganizationId;

    if (!organizationId) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "No hay una organización activa",
      });
    }

    const validHiringManagerCount = await ctx.db.member.count({
      where: {
        organizationId,
        role: "hiringManager",
        userId: { in: input.hiringManagerIds },
        user: { banned: false, deletedAt: null },
      },
    });

    if (validHiringManagerCount !== new Set(input.hiringManagerIds).size) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Uno o más Hiring Managers no son válidos",
      });
    }
    try {
      // creating the job opening
      const jobOpening = await ctx.db.$transaction(async (tx) => {
        const jobOpening = await tx.jobOpening.create({
          select: {
            id: true,
          },
          data: {
            name: input.name,
            status: input.status,
            //seniority: input.seniority,
            stages: input.stages,
            location: input.location,
            openingDate: input.openingDate,
            targetClosingDate: input.closingDate,
            ...(input.status === JobOpeningStatus.Closed
              ? { closingDate: new Date() }
              : {}),
            // hiringManagers: input.hiringManagers

            area: {
              connect: {
                id: input.area,
              },
            },
            seniorities: {
              connect: input.seniorityIds.map((id) => ({ id })),
            },

            hiringManagers: {
              connect: input.hiringManagerIds.map((id) => ({ id })),
            },
          },
        });
        return jobOpening;
      });

      return jobOpening;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "CONFLICT",
        });
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "NOT_FOUND",
        });
      }
      throw error;
    }
  });
