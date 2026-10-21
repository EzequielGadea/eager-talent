import { TRPCError } from "@trpc/server";
import { isAPIError } from "better-auth/api";
import { z } from "zod";

import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

const inviteInput = z.object({
  email: z.string().trim().toLowerCase().email(),
  role: z.enum(["recruiter", "hiringManager"]),
  resend: z.boolean().optional(),
});

const INVITATION_ERROR_MESSAGES: Record<string, string> = {
  USER_IS_ALREADY_A_MEMBER_OF_THIS_ORGANIZATION:
    "Este correo ya pertenece a un usuario de la organización.",
  USER_IS_ALREADY_INVITED_TO_THIS_ORGANIZATION:
    "Este correo ya tiene una invitación pendiente.",
  YOU_ARE_NOT_ALLOWED_TO_INVITE_USERS_TO_THIS_ORGANIZATION:
    "No tenés permisos para invitar usuarios a esta organización.",
  YOU_ARE_NOT_ALLOWED_TO_INVITE_USER_WITH_THIS_ROLE:
    "No tenés permisos para invitar usuarios con este rol.",
  INVITATION_LIMIT_REACHED:
    "Se alcanzó el límite de invitaciones. Intentá nuevamente más tarde.",
};

const EMAIL_FAILURE_MESSAGE =
  "No se pudo enviar el correo de invitación. Verificá la configuración del servidor de correo e intentá nuevamente.";

export const invite = protectedProcedure
  .input(inviteInput)
  .mutation(async ({ ctx, input }) => {
    const { email, role, resend } = input;
    const organizationId = ctx.session.session.activeOrganizationId;

    if (!organizationId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No hay una organización activa",
      });
    }

    const [existingUser, pendingInvitation] = await Promise.all([
      ctx.db.user.findUnique({ where: { email }, select: { id: true } }),
      ctx.db.invitation.findFirst({
        where: { email, organizationId, status: "pending" },
        select: { id: true },
      }),
    ]);

    const tokenFilter = (userId: string) => ({
      identifier: { startsWith: "reset-password:" },
      value: userId,
    });

    // Keep previous links until a new invitation email is successfully sent.
    const previousTokenIds = existingUser
      ? (
          await ctx.db.verification.findMany({
            where: tokenFilter(existingUser.id),
            select: { id: true },
          })
        ).map((token) => token.id)
      : [];

    let invitationId: string;

    try {
      const invitation = await auth.api.createInvitation({
        headers: ctx.headers,
        body: { email, role, resend, organizationId },
      });
      invitationId = invitation.id;
    } catch (error) {
      if (isAPIError(error)) {
        const code = (error.body as { code?: string } | undefined)?.code;
        throw new TRPCError({
          code: error.statusCode === 403 ? "FORBIDDEN" : "BAD_REQUEST",
          message:
            (code && INVITATION_ERROR_MESSAGES[code]) ??
            "No se pudo enviar la invitación. Intentá nuevamente.",
        });
      }

      throw error;
    }

    // Better Auth swallows errors thrown while sending, so delivery is verified by the stored token
    const user = await ctx.db.user.findUnique({
      where: { email },
      select: { id: true },
    });
    const wasSent = user
      ? (await ctx.db.verification.count({
          where: {
            ...tokenFilter(user.id),
            id: { notIn: previousTokenIds },
          },
        })) > 0
      : false;

    if (!wasSent) {
      // Roll back only what this request created
      if (!pendingInvitation) {
        await ctx.db.invitation.deleteMany({ where: { id: invitationId } });
      }
      if (user && !existingUser) {
        await ctx.db.user.deleteMany({ where: { id: user.id } });
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: EMAIL_FAILURE_MESSAGE,
      });
    }

    if (existingUser && previousTokenIds.length > 0) {
      await ctx.db.verification.deleteMany({
        where: {
          ...tokenFilter(existingUser.id),
          id: { in: previousTokenIds },
        },
      });
    }

    return { email };
  });
