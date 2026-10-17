import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { auth } from "~/lib/auth";
import { getUserStatus } from "~/server/api/procedures/get-user-status";
import { protectedProcedure } from "~/server/api/trpc";

export const getAllUsers = protectedProcedure
  .input(z.object({}))
  .query(async ({ ctx }) => {
    const canReadUsersResult = await auth.api.hasPermission({
      headers: ctx.headers,
      body: {
        permissions: {
          user: ["read"],
        },
      },
    });

    if (!canReadUsersResult.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tenés permiso para consultar usuarios",
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
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        expiresAt: true,
      },
    });

    const invitationsByEmail = new Map<string, typeof invitations>();

    for (const invitation of invitations) {
      const email = invitation.email.toLowerCase();
      invitationsByEmail.set(email, [
        ...(invitationsByEmail.get(email) ?? []),
        invitation,
      ]);
    }

    const users = await ctx.db.user.findMany({
      where: {
        id: {
          not: ctx.session.user.id,
        },
        deletedAt: null,
        OR: [
          { members: { some: { organizationId } } },
          { email: { in: invitations.map((invitation) => invitation.email) } },
        ],
      },
      select: {
        id: true,
        name: true,
        lastName: true,
        email: true,
        banned: true,
        lastAccess: true,
        members: {
          where: { organizationId },
          select: { role: true },
        },
        _count: {
          select: {
            assignedJobOpenings: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    const now = new Date();

    return users.map((user) => {
      const userInvitations =
        invitationsByEmail.get(user.email.toLowerCase()) ?? [];

      return {
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        role:
          user.members[0]?.role === "owner"
            ? "recruiter"
            : (user.members[0]?.role ?? userInvitations[0]?.role ?? null),
        status: getUserStatus({
          banned: user.banned,
          isMember: user.members.length > 0,
          invitations: userInvitations,
          now,
        }),
        lastAccess: user.lastAccess?.toISOString() ?? null,
        pendingInvitationId:
          userInvitations.find(
            (invitation) =>
              invitation.status === "pending" && invitation.expiresAt > now,
          )?.id ?? null,
        assignedJobOpeningsCount: user._count.assignedJobOpenings,
      };
    });
  });
