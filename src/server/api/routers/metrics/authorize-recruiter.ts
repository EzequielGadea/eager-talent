import { TRPCError } from "@trpc/server";

import type { createTRPCContext } from "~/server/api/trpc";

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

export async function authorizeRecruiter(ctx: Context) {
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const organizationId = ctx.session.session.activeOrganizationId;
  const member = organizationId
    ? await ctx.db.member.findUnique({
        where: {
          organizationId_userId: {
            organizationId,
            userId: ctx.session.user.id,
          },
        },
        select: { role: true },
      })
    : null;
  const recruiterRoles = new Set(["recruiter", "admin", "owner"]);

  if (!member || !recruiterRoles.has(member.role)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "No tenés permiso para consultar las métricas",
    });
  }
}
