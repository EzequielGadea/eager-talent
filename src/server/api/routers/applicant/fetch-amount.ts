import { protectedProcedure } from "~/server/api/trpc";

export const fetchAmount = protectedProcedure.query(async ({ ctx }) => {
  const result = await ctx.db.applicant.count();
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return result;
});
