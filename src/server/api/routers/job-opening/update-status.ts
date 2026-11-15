import { headers } from "next/headers";
import { z } from "zod";

import { TRPCError } from "@trpc/server";

import type { Prisma } from "~/generated/prisma/client";
import { JobOpeningStatus } from "~/generated/prisma/enums";
import { auth } from "~/lib/auth";
import { stageClosingsSchema } from "~/lib/validations/stage-metrics";
import { protectedProcedure } from "~/server/api/trpc";
import {
  getClosingStages,
  lockJobOpening,
  STAGES_CHANGED_MESSAGE,
} from "./stage-metrics-utils";

export const updateStatus = protectedProcedure
  .input(
    z.object({
      jobOpeningId: z.string(),
      status: z.enum(JobOpeningStatus),
      // Closing dates of the metric stages still open when closing.
      stageClosings: stageClosingsSchema.optional(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const permission = await auth.api.hasPermission({
      headers: await headers(),
      body: {
        permissions: {
          jobOpening: ["update"],
        },
      },
    });

    if (!permission.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tienes permiso para modificar la vacante",
      });
    }

    const jobOpening = await ctx.db.jobOpening.findUnique({
      where: {
        id: input.jobOpeningId,
      },
      select: {
        id: true,
        status: true,
        hasBeenOpened: true,
        openingDate: true,
        _count: {
          select: {
            applications: {
              where: { deletedAt: null },
            },
          },
        },
        stages: true,
      },
    });

    if (!jobOpening) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Job opening not found",
      });
    }

    if (
      jobOpening.status === JobOpeningStatus.Closed ||
      jobOpening.status === JobOpeningStatus.Cancelled
    ) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message:
          "No se puede modificar el estado de una vacante cerrada o cancelada",
      });
    }

    if (
      input.status === JobOpeningStatus.Draft &&
      input.status !== jobOpening.status
    ) {
      if (jobOpening.openingDate <= new Date()) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "No se puede pasar a borrador una vacante cuya fecha de apertura ya pasó",
        });
      }

      if (jobOpening._count.applications > 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "No se puede pasar a borrador una vacante que tiene candidatos en el pipeline",
        });
      }
    }

    const isClosing = input.status === JobOpeningStatus.Closed;

    if (isClosing && jobOpening.openingDate > new Date()) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No se puede cerrar una vacante antes de su fecha de inicio",
      });
    }

    const hasBeenOpened =
      jobOpening.hasBeenOpened ||
      jobOpening.status === "Open" ||
      input.status === "Open";

    await ctx.db.$transaction(async (tx) => {
      let closingStages: Prisma.InputJsonValue | undefined;

      if (isClosing) {
        // No candidate can enter a metric stage while it is being closed.
        await lockJobOpening(tx, jobOpening.id);
        closingStages = (await getClosingStages(
          tx,
          jobOpening,
          input.stageClosings,
        )) as Prisma.InputJsonValue;
      }

      const { count } = await tx.jobOpening.updateMany({
        where: {
          id: input.jobOpeningId,
          status: {
            notIn: [JobOpeningStatus.Closed, JobOpeningStatus.Cancelled],
          },
          // Closing writes the stages it read: it must not overwrite a
          // reopened stage or an edited target saved meanwhile.
          ...(isClosing
            ? { stages: { equals: jobOpening.stages as Prisma.InputJsonValue } }
            : {}),
        },
        data: {
          status: input.status,
          hasBeenOpened,
          ...(isClosing ? { closingDate: new Date() } : {}),
          ...(closingStages ? { stages: closingStages } : {}),
        },
      });

      if (count !== 1) {
        const current = isClosing
          ? await tx.jobOpening.findUnique({
              where: { id: input.jobOpeningId },
              select: { status: true },
            })
          : null;

        if (
          current &&
          current.status !== JobOpeningStatus.Closed &&
          current.status !== JobOpeningStatus.Cancelled
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: STAGES_CHANGED_MESSAGE,
          });
        }

        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "No se puede modificar el estado de una vacante cerrada o cancelada",
        });
      }
    });

    return {
      id: jobOpening.id,
      status: input.status,
      hasBeenOpened,
    };
  });
