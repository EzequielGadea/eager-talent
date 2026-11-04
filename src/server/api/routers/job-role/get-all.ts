import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "~/server/api/trpc";

export const getAllRoles = protectedProcedure
  .input(z.object({}))
  .query(async ({ ctx }) => {
    const roles = await ctx.db.jobRole.findMany({
      select: {
        id: true,
        name: true,
        _count: { select: { applicants: true } },
      },
      orderBy: {
        name: "asc",
      },
    });

    if (!roles) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return roles;
  });
