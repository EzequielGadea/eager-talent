import { TRPCError  } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "~/server/api/trpc";

export const getAllRoles = protectedProcedure
    .input(z.object({}))
    .query(async ({ ctx }) => {
        const roles = await ctx.db.role.findMany({
            where : { deletedAt: null },
            
            select: { id: true, name: true },
        });

    if (!roles) {
            throw new TRPCError({ code: "NOT_FOUND" });
        }

        return roles;
    });