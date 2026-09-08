import { TRPCError  } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "~/server/api/trpc";

export const getAllAreas = protectedProcedure
    .input(z.object({}))
    .query(async ({ ctx }) => {
        const areas = await ctx.db.area.findMany({
            where : { deletedAt: null },
            
            select: { id: true, name: true },
        });

    if (!areas) {
            throw new TRPCError({ code: "NOT_FOUND" });
        }

        return areas;
    });