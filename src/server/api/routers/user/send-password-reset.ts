import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

const RESET_PASSWORD_PATH = "/reset-password";

const sendPasswordResetInput = z.object({
  userId: z.string().min(1),
});

export const sendPasswordReset = protectedProcedure
  .input(sendPasswordResetInput)
  .mutation(async ({ ctx, input }) => {
    const canUpdateUsers = await auth.api.hasPermission({
      headers: ctx.headers,
      body: { permissions: { user: ["update"] } },
    });

    if (!canUpdateUsers.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tenés permiso para restablecer contraseñas",
      });
    }

    const organizationId = ctx.session.session.activeOrganizationId;

    if (!organizationId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No hay una organización activa",
      });
    }

    // Active means: member of the organization, not banned and not deleted
    const user = await ctx.db.user.findFirst({
      where: {
        id: input.userId,
        banned: false,
        deletedAt: null,
        members: { some: { organizationId } },
      },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "El usuario no existe o no está activo",
      });
    }

    const tokenFilter = {
      identifier: { startsWith: "reset-password:" },
      value: user.id,
    };

    // Invalidates any link previously sent to this user
    await ctx.db.verification.deleteMany({ where: tokenFilter });

    await auth.api.requestPasswordReset({
      headers: ctx.headers,
      body: { email: user.email, redirectTo: RESET_PASSWORD_PATH },
    });

    const wasSent = await ctx.db.verification.count({ where: tokenFilter });

    if (wasSent === 0) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "No fue posible enviar el correo de restablecimiento",
      });
    }

    return { email: user.email };
  });
