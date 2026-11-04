import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "~/server/api/trpc";

export const getAllSeniorities = protectedProcedure
  .input(z.object({}))
  .query(async ({ ctx }) => {
    const seniorities = await ctx.db.seniority.findMany({
      select: {
        id: true,
        name: true,
        order: true,
        _count: { select: { applicants: true, jobOpenings: true } },
      },

      orderBy: { order: "asc" },
    });

    if (!seniorities) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return seniorities;
  });
