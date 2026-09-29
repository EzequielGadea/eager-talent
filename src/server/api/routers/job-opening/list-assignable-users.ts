import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

export const listAssignableUsers = protectedProcedure
  .input(z.object({}))
  .query(async ({ ctx }) => {
    const permission = await auth.api.hasPermission({
      headers: ctx.headers,
      body: {
        permissions: {
          jobOpening: ["update"],
        },
      },
    });

    if (!permission.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tienes permiso para modificar vacantes",
      });
    }

    const organizationId = ctx.session.session.activeOrganizationId;

    if (!organizationId) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "No hay una organizacion activa",
      });
    }

    const members = await ctx.db.member.findMany({
      where: {
        organizationId,
        user: {
          status: "Active",
          banned: false,
        },
      },
      select: {
        user: {
          select: {
            id: true,
            name: true,
            lastName: true,
            image: true,
            _count: {
              select: {
                assignedJobOpenings: true,
              },
            },
          },
        },
      },
    });

    return members
      .map(({ user }) => ({
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        image: user.image,
        jobOpeningCount: user._count.assignedJobOpenings,
      }))
      .sort((firstUser, secondUser) =>
        `${firstUser.name} ${firstUser.lastName}`.localeCompare(
          `${secondUser.name} ${secondUser.lastName}`,
          "es",
        ),
      );
  });
