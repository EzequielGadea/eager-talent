import { protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const fetchAmount = protectedProcedure
    .query(async ({ctx, input}) => {
        const result = await ctx.db.applicant.count();
        console.log("loooooooog");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return result;
})
    