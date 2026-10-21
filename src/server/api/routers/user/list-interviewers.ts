import { TRPCError } from "@trpc/server";

import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

export const listInterviewers = protectedProcedure.query(async ({ ctx }) => {
  const permission = await auth.api.hasPermission({
    headers: ctx.headers,
    body: { permissions: { interview: ["create"] } },
  });

  if (!permission.success) {
    throw new TRPCError({ code: "FORBIDDEN" });
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
      role: "hiringManager",
      user: {
        //status: "Active",
        banned: false,
        deletedAt: null,
      },
    },
    select: {
      role: true,
      user: {
        select: {
          id: true,
          name: true,
          lastName: true,
        },
      },
    },
  });

  return members
    .map(({ role, user }) => ({ ...user, role }))
    .sort((firstUser, secondUser) =>
      `${firstUser.name} ${firstUser.lastName}`.localeCompare(
        `${secondUser.name} ${secondUser.lastName}`,
        "es",
      ),
    );
});
