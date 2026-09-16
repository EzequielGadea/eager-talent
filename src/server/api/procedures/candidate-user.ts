import { TRPCError } from "@trpc/server";

import { protectedProcedure } from "~/server/api/trpc";

export const candidateUserProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { role: true },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Candidato no encontrado",
      });
    }

    return next({
      ctx: {
        candidateAccessWhere:
          user.role === "HiringManager"
            ? { hiringManagers: { some: { id: ctx.session.user.id } } }
            : {},
        candidatePermissions: {
          canEditProfile: user.role === "Recruiter",
          canViewLogs:
            user.role === "Recruiter" || user.role === "HiringManager",
          readOnly: user.role === "HiringManager",
        },
      },
    });
  },
);
