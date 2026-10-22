import { headers } from "next/headers";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

export const deleteTag = protectedProcedure
  .input(
    z.object({
      id: z.string().cuid(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const permission = await auth.api.hasPermission({
      headers: await headers(),
      body: { permissions: { tag: ["delete"] } },
    });
    if (!permission.success) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const tag = await ctx.db.tag.findUnique({
      where: { id: input.id },
      select: { _count: { select: { applicants: true } } },
    });

    if (!tag) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "La etiqueta no existe.",
      });
    }

    if (tag._count.applicants > 0) {
      throw new TRPCError({
        code: "CONFLICT",
        message:
          "No se puede eliminar la etiqueta porque tiene candidatos asignados.",
      });
    }

    await ctx.db.tag.delete({
      where: { id: input.id },
    });
  });
