import { TRPCError  } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "~/server/api/trpc";

export const getAllTags = protectedProcedure
    .input(z.object({}))
    .query(async ({ ctx }) => {
        const tags = await ctx.db.tag.findMany({
            where : { deletedAt: null },
            
            select: { id: true, name: true },
        });

    if (!tags) {
            throw new TRPCError({ code: "NOT_FOUND" });
        }

        return tags;
    });