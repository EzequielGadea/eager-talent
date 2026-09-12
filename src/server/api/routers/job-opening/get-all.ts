import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "~/server/api/trpc";

export const getAllJobOpenings = protectedProcedure
  .input(z.object({}))
  .query(async ({ ctx }) => {
    const jobOpenings = await ctx.db.jobOpening.findMany({
      select: { id: true, name: true },
    });

    if (!jobOpenings) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return jobOpenings;
  });
