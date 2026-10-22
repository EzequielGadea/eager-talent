import { headers } from "next/headers";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

export const deleteArea = protectedProcedure
  .input(
    z.object({
      id: z.string().cuid(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const permission = await auth.api.hasPermission({
      headers: await headers(),
      body: { permissions: { area: ["delete"] } },
    });
    if (!permission.success) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const area = await ctx.db.area.findUnique({
      where: { id: input.id },
      select: {
        _count: { select: { applicants: true, jobOpenings: true } },
      },
    });

    if (!area) {
      throw new TRPCError({ code: "NOT_FOUND", message: "El área no existe." });
    }

    const deleteRestrictions = [
      area._count.applicants > 0 ? "candidatos asignados" : null,
      area._count.jobOpenings > 0 ? "vacantes asociadas" : null,
    ].filter((restriction): restriction is string => restriction !== null);

    if (deleteRestrictions.length > 0) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `No se puede eliminar el área porque tiene ${deleteRestrictions.join(
          " y ",
        )}.`,
      });
    }

    await ctx.db.area.delete({
      where: { id: input.id },
    });
  });
