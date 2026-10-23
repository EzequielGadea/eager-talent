import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { auth } from "~/lib/auth";

import { protectedProcedure } from "~/server/api/trpc";

export const deleteDisqualificationMotive = protectedProcedure
  .input(
    z.object({
      id: z.string().cuid(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const permission = await auth.api.hasPermission({
      headers: ctx.headers,
      body: {
        permissions: {
          disqualificationMotive: ["delete"],
        },
      },
    });

    if (!permission.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tienes permisos para eliminar motivos de descalificación.",
      });
    }

    const motive = await ctx.db.disqualificationMotive.findUnique({
      where: { id: input.id },
      select: { _count: { select: { applications: true } } },
    });

    if (!motive) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "El motivo de descalificación no existe.",
      });
    }

    if (motive._count.applications > 0) {
      throw new TRPCError({
        code: "CONFLICT",
        message:
          "No se puede eliminar el motivo porque está asociado a postulaciones.",
      });
    }

    await ctx.db.disqualificationMotive.delete({
      where: { id: input.id },
    });
  });
