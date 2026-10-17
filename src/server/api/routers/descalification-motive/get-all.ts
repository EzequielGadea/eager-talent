import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "~/server/api/trpc";

export const getAllDescalificationMotive = protectedProcedure
  .input(z.object({}))
  .query(async ({ ctx }) => {
    const motives = await ctx.db.disqualificationMotive.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    if (!motives) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return motives;
  });
