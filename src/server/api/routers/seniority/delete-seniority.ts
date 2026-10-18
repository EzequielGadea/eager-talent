import { headers } from "next/headers";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

export const deleteSeniority = protectedProcedure
  .input(
    z.object({
      id: z.string().cuid(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const permission = await auth.api.hasPermission({
      headers: await headers(),
      body: { permissions: { seniority: ["delete"] } },
    });
    if (!permission.success) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const seniority = await ctx.db.seniority.findFirst({
      where: { id: input.id, deletedAt: null },
      select: {
        _count: { select: { applicants: true, jobOpenings: true } },
      },
    });

    if (!seniority) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "La seniority no existe.",
      });
    }

    const deleteRestrictions = [
      seniority._count.applicants > 0 ? "candidatos asignados" : null,
      seniority._count.jobOpenings > 0 ? "vacantes asociadas" : null,
    ].filter((restriction): restriction is string => restriction !== null);

    if (deleteRestrictions.length > 0) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `No se puede eliminar la seniority porque tiene ${deleteRestrictions.join(
          " y ",
        )}.`,
      });
    }

    await ctx.db.seniority.update({
      where: { id: input.id },
      data: { deletedAt: new Date() },
    });
  });
