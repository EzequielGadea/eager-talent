import { protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

export const fetchAmount = protectedProcedure.query(async ({ ctx }) => {
  try {
    const result = await ctx.db.applicant.count();
    //delay para probar fallbacks
    //await new Promise((resolve) => setTimeout(resolve, 1000));
    return result;
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Unexpected prisma error",
      });
    }
    throw e;
  }
});
