import { TRPCError } from "@trpc/server";
import type { Prisma } from "~/generated/prisma/client";
import { z } from "zod";
import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

export const saveApplicantNoteProcedure = protectedProcedure
  .input(
    z.object({
      applicantId: z.string().min(1),
      content: z.json(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const applicant = await ctx.db.applicant.findUnique({
      where: { id: input.applicantId },
      select: { id: true, note: { select: { id: true } } },
    });

    if (!applicant) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Candidato no encontrado",
      });
    }

    const permission = await auth.api.hasPermission({
      headers: ctx.headers,
      body: {
        permissions: {
          applicantNote: [applicant.note ? "update" : "create"],
        },
      },
    });

    if (!permission.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tenés permiso para modificar las notas del candidato",
      });
    }

    const data = {
      content: input.content as Prisma.InputJsonValue,
      lastModifiedById: ctx.session.user.id,
    };

    return ctx.db.applicantNote.upsert({
      where: { applicantId: input.applicantId },
      create: { applicantId: input.applicantId, ...data },
      update: data,
      select: {
        lastModified: true,
        lastModifiedBy: {
          select: { name: true, lastName: true },
        },
      },
    });
  });
