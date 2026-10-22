import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

const deleteUserInput = z.object({
  userId: z.string().min(1),
});

export const deleteUser = protectedProcedure
  .input(deleteUserInput)
  .mutation(async ({ ctx, input }) => {
    const canDeleteUsers = await auth.api.hasPermission({
      headers: ctx.headers,
      body: { permissions: { user: ["delete"] } },
    });

    if (!canDeleteUsers.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tenés permiso para eliminar usuarios",
      });
    }

    if (input.userId === ctx.session.user.id) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No podés eliminar tu propio usuario",
      });
    }

    const organizationId = ctx.session.session.activeOrganizationId;

    if (!organizationId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No hay una organización activa",
      });
    }

    const invitations = await ctx.db.invitation.findMany({
      where: { organizationId },
      select: { email: true },
    });

    const user = await ctx.db.user.findFirst({
      where: {
        id: input.userId,
        deletedAt: null,
        OR: [
          { members: { some: { organizationId } } },
          { email: { in: invitations.map((invitation) => invitation.email) } },
        ],
      },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No se encontró el usuario",
      });
    }

    // Banning also revokes every active session of the user
    await auth.api.banUser({
      headers: ctx.headers,
      body: { userId: user.id, banReason: "Usuario eliminado" },
    });

    await ctx.db.$transaction([
      ctx.db.invitation.updateMany({
        where: { email: user.email, status: "pending" },
        data: { status: "canceled" },
      }),
      ctx.db.user.update({
        where: { id: user.id },
        data: {
          email: `deleted+${user.id}@deleted.invalid`,
          deletedAt: new Date(),
        },
      }),
    ]);

    return { id: user.id };
  });
