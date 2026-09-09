import { TRPCError  } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "~/server/api/trpc";

export const getAllSeniorities = protectedProcedure
    .input(z.object({}))
    .query(async ({ ctx }) => {
        const seniorities = await ctx.db.seniority.findMany({
            where : { deletedAt: null },
            
            select: { id: true, name: true },
        });

    if (!seniorities) {
            throw new TRPCError({ code: "NOT_FOUND" });
        }

        return seniorities;
    });