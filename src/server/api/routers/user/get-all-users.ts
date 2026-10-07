import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { auth } from "~/lib/auth";
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

    const members = await ctx.db.member.findMany({
      where: {
        organizationId,
        userId: {
          not: ctx.session.user.id,
        },
      },
      select: {
        role: true,
        user: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
            status: true,
            lastAccess: true,
            _count: {
              select: {
                assignedJobOpenings: true,
              },
            },
          },
        },
      },
      orderBy: {
        user: {
          name: "asc",
        },
      },
    });

    return members.map((member) => ({
      id: member.user.id,
      name: member.user.name,
      lastName: member.user.lastName,
      email: member.user.email,
      role: member.role,
      status: member.user.status,
      lastAccess: member.user.lastAccess?.toISOString() ?? null,
      assignedJobOpeningsCount: member.user._count.assignedJobOpenings,
    }));
  });