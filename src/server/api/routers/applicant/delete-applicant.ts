import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";
import { validPublicLinkWhere } from "~/server/public-link/validity";

export const deleteApplicant = protectedProcedure
  .input(
    z.object({
      id: z.string().min(1),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const permission = await auth.api.hasPermission({
      headers: ctx.headers,
      body: { permissions: { applicant: ["delete"] } },
    });

    if (!permission.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tenés permiso para eliminar candidatos",
      });
    }

    const applicant = await ctx.db.applicant.findUnique({
      where: { id: input.id, deletedAt: null },
      select: { id: true, email: true },
    });

    if (!applicant) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Candidato no encontrado",
      });
    }

    const now = new Date();
    const softDelete = { deletedAt: now };

    await ctx.db.$transaction(async (tx) => {
      // The email is unique, so it is released to let the same person be registered again.
      const { count } = await tx.applicant.updateMany({
        where: { id: applicant.id, deletedAt: null },
        data: {
          ...softDelete,
          ...(applicant.email && {
            email: `deleted+${applicant.id}@deleted.invalid`,
          }),
        },
      });

      if (count !== 1) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Candidato no encontrado",
        });
      }

      await tx.publicLink.updateMany({
        where: { applicantId: applicant.id, ...validPublicLinkWhere(now) },
        data: { revokedAt: now },
      });

      await tx.interviewNote.updateMany({
        where: {
          interview: { applicantId: applicant.id },
          deletedAt: null,
        },
        data: softDelete,
      });

      await tx.interview.updateMany({
        where: { applicantId: applicant.id, deletedAt: null },
        data: softDelete,
      });

      await tx.applicantNote.updateMany({
        where: { applicantId: applicant.id, deletedAt: null },
        data: softDelete,
      });

      await tx.activity.updateMany({
        where: { applicantId: applicant.id, deletedAt: null },
        data: softDelete,
      });

      await tx.application.updateMany({
        where: { applicantId: applicant.id, deletedAt: null },
        data: softDelete,
      });
    });

    return { id: applicant.id };
  });
