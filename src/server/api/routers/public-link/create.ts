import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { Prisma } from "~/generated/prisma/client";
import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";
import {
  getPublicLinkExpirationDate,
  publicLinkExpirationDaysSchema,
} from "~/server/public-link/expiration";
import { generatePublicLinkToken } from "~/server/public-link/token";
import { publicLinkDtoSelect, toPublicLinkDto } from "./dto";

type UniqueViolationMeta = {
  driverAdapterError?: { cause?: { constraint?: { fields?: string[] } } };
};

// Only a unique violation on PublicLink.token counts as a token collision.
function isTokenUniqueViolation(error: unknown) {
  if (
    !(error instanceof Prisma.PrismaClientKnownRequestError) ||
    error.code !== "P2002"
  ) {
    return false;
  }

  const meta = error.meta as UniqueViolationMeta | undefined;

  return (
    meta?.driverAdapterError?.cause?.constraint?.fields?.includes("token") ??
    false
  );
}

export const createPublicLink = protectedProcedure
  .input(
    z.object({
      applicantId: z.string().min(1),
      jobOpeningId: z.string().min(1),
      name: z
        .string()
        .trim()
        .min(1, "Ingresá un nombre para el enlace.")
        .max(100, "El nombre puede tener hasta 100 caracteres."),
      includeSalary: z.boolean(),
      expirationDays: publicLinkExpirationDaysSchema,
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const permission = await auth.api.hasPermission({
      headers: ctx.headers,
      body: { permissions: { publicLink: ["create"] } },
    });

    if (!permission.success) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const application = await ctx.db.application.findUnique({
      where: {
        applicantId_jobOpeningId: {
          applicantId: input.applicantId,
          jobOpeningId: input.jobOpeningId,
        },
        deletedAt: null,
      },
      select: { applicantId: true },
    });

    if (!application) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "La postulación no existe",
      });
    }

    const now = new Date();

    try {
      const link = await ctx.db.$transaction(async (tx) => {
        const created = await tx.publicLink.create({
          data: {
            name: input.name,
            token: generatePublicLinkToken(),
            includeSalary: input.includeSalary,
            creationDate: now,
            expirationDate: getPublicLinkExpirationDate(
              input.expirationDays,
              now,
            ),
            createdById: ctx.session.user.id,
            applicantId: input.applicantId,
            jobOpeningId: input.jobOpeningId,
          },
          select: publicLinkDtoSelect,
        });

        await tx.activity.create({
          data: {
            applicantId: input.applicantId,
            jobOpeningId: input.jobOpeningId,
            createdById: ctx.session.user.id,
            description: `creó el enlace público "${input.name}"`,
          },
        });

        return created;
      });

      return toPublicLinkDto(link, now);
    } catch (error) {
      // A 256-bit token collision is practically impossible; it is reported
      // as a controlled failure instead of being retried silently.
      if (isTokenUniqueViolation(error)) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "No se pudo generar el enlace. Intentá de nuevo.",
        });
      }

      throw error;
    }
  });
