import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

export const revokeHiringManagerAccess = protectedProcedure
  .input(
    z.object({
      applicantId: z.string().min(1),
      hiringManagerId: z.string().min(1),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const permission = await auth.api.hasPermission({
      headers: ctx.headers,
      body: {
        permissions: {
          applicant: ["update"],
        },
      },
    });

    if (!permission.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tenés permiso para quitar el acceso al candidato",
      });
    }

    const organizationId = ctx.session.session.activeOrganizationId;

    if (!organizationId) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "No hay una organización activa",
      });
    }

    const applicant = await ctx.db.applicant.findUnique({
      where: {
        id: input.applicantId,
      },
      select: {
        id: true,
      },
    });

    if (!applicant) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Candidato no encontrado",
      });
    }

    const result = await ctx.db.applicantHiringManager.deleteMany({
      where: {
        applicantId: input.applicantId,
        hiringManagerId: input.hiringManagerId,
      },
    });

    return {
      revoked: result.count > 0,
    };
  });
