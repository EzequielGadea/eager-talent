import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

// Values written by better-auth's organization plugin
type InvitationStatus = "pending" | "accepted" | "rejected" | "canceled";

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
      select: { email: true, role: true, status: true },
    });

    const latestInvitationByEmail = new Map<string, (typeof invitations)[0]>();

    for (const invitation of invitations) {
      const email = invitation.email.toLowerCase();

      if (!latestInvitationByEmail.has(email)) {
        latestInvitationByEmail.set(email, invitation);
      }
    }

    const pendingInvitationEmails = invitations
      .filter((invitation) => invitation.status === "pending")
      .map((invitation) => invitation.email);

    const users = await ctx.db.user.findMany({
      where: {
        id: {
          not: ctx.session.user.id,
        },
        OR: [
          { members: { some: { organizationId } } },
          { email: { in: pendingInvitationEmails } },
        ],
      },
      select: {
        id: true,
        name: true,
        lastName: true,
        email: true,
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

    return users.map((user) => {
      const invitation = latestInvitationByEmail.get(user.email.toLowerCase());

      return {
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        role: user.members[0]?.role ?? invitation?.role ?? null,
        // Users without an invitation (e.g. seeded or owners) are already active members
        status: (invitation?.status ?? "accepted") as InvitationStatus,
        lastAccess: user.lastAccess?.toISOString() ?? null,
        assignedJobOpeningsCount: user._count.assignedJobOpenings,
      };
    });
  });
