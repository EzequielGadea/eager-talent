import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "~/server/api/trpc";

export const getAllHiringManagers = protectedProcedure
  .input(z.object({}))
  .query(async ({ ctx }) => {
    const hiringManagers = await ctx.db.member.findMany({
      where: {
        role: "hiringManager",
      },
      select: {
        user: true,
      },
    });
    if (!hiringManagers) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return hiringManagers.map((member) => member.user);
  });
