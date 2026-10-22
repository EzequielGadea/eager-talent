import { protectedProcedure } from "~/server/api/trpc";
import { authorizeRecruiter } from "./authorize-recruiter";

export const getClosedOpenings = protectedProcedure.query(async ({ ctx }) => {
  await authorizeRecruiter(ctx);

  return ctx.db.jobOpening.findMany({
    where: { status: "Closed" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
});
