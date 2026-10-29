import { headers } from "next/headers";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

export const deleteRole = protectedProcedure
  .input(
    z.object({
      id: z.string().cuid(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const permission = await auth.api.hasPermission({
      headers: await headers(),
      body: { permissions: { jobRole: ["delete"] } },
    });
    if (!permission.success) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const role = await ctx.db.jobRole.findUnique({
      where: { id: input.id },
      select: { _count: { select: { applicants: true } } },
    });

    if (!role) {
      throw new TRPCError({ code: "NOT_FOUND", message: "El rol no existe." });
    }

    if (role._count.applicants > 0) {
      throw new TRPCError({
        code: "CONFLICT",
        message:
          "No se puede eliminar el rol porque tiene candidatos asignados.",
      });
    }

    await ctx.db.jobRole.delete({
      where: { id: input.id },
    });
  });
