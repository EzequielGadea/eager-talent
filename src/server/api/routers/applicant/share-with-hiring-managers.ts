import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

const shareWithHiringManagersInput = z.object({
  applicantId: z.string().min(1),
  hiringManagerIds: z
    .array(z.string().min(1))
    .min(1, "Seleccioná al menos un Hiring Manager")
    .refine(
      (hiringManagerIds) =>
        new Set(hiringManagerIds).size === hiringManagerIds.length,
      {
        message: "Los Hiring Managers no pueden estar repetidos",
      },
    ),
});

export const shareWithHiringManagers = protectedProcedure
  .input(shareWithHiringManagersInput)
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
        message: "No tenés permiso para compartir candidatos",
      });
    }

    const organizationId = ctx.session.session.activeOrganizationId;

    if (!organizationId) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "No hay una organización activa",
      });
    }

    const [applicant, validHiringManagerCount] = await Promise.all([
      ctx.db.applicant.findUnique({
        where: {
          id: input.applicantId,
        },
        select: {
          id: true,
        },
      }),
      ctx.db.member.count({
        where: {
          organizationId,
          role: "hiringManager",
          userId: {
            in: input.hiringManagerIds,
          },
          user: {
            status: "Active",
            banned: false,
          },
        },
      }),
    ]);

    if (!applicant) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Candidato no encontrado",
      });
    }

    if (validHiringManagerCount !== input.hiringManagerIds.length) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Uno o más Hiring Managers no son válidos",
      });
    }

    const result = await ctx.db.applicantHiringManager.createMany({
      data: input.hiringManagerIds.map((hiringManagerId) => ({
        applicantId: input.applicantId,
        hiringManagerId,
        sharedByUserId: ctx.session.user.id,
      })),
      skipDuplicates: true,
    });

    return {
      sharedCount: result.count,
    };
  });
