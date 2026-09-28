import { z } from "zod";
import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";
import { Prisma } from "~/generated/prisma/client";
import { JobOpeningStatus } from "~/generated/prisma/enums";
import { TRPCError } from "@trpc/server";

const stageSchema = z.object({
  key: z.string(),
  name: z.string(),
  type: z.string(),
  color: z.string(),
  label: z.string(),
});


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
      stages: z.array(stageSchema)
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
        message: "No tenes permisos para crear una vacante",
      });
    }
    try {
      // creating the job opening
      const obj = {}
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
          message: "La vacante ya existe",
        });
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "El área, seniority o hiring manager indicado no existe",
        });
      }
      throw error;
    }
  });
