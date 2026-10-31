import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { auth } from "~/lib/auth";
import { getUserStatus } from "~/server/api/procedures/get-user-status";
import { protectedProcedure } from "~/server/api/trpc";

const USERS_PER_PAGE = 8;

export const getAllUsers = protectedProcedure
  .input(z.object({ page: z.number().int().min(1).default(1) }))
  .query(async ({ ctx, input }) => {
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

    const where = {
      id: {
        not: ctx.session.user.id,
      },
      deletedAt: null,
      OR: [
        { members: { some: { organizationId } } },
        { email: { in: invitations.map((invitation) => invitation.email) } },
      ],
    };

    const total = await ctx.db.user.count({ where });

    const users = await ctx.db.user.findMany({
      where,
      skip: (input.page - 1) * USERS_PER_PAGE,
      take: USERS_PER_PAGE,
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
      orderBy: [{ name: "asc" }, { id: "asc" }],
    });

    const now = new Date();

    const items = users.map((user) => {
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

    return { users: items, total, pageSize: USERS_PER_PAGE };
  });
