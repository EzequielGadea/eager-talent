import { protectedProcedure } from "~/server/api/trpc";

export const fetchDisqualificationMotives = protectedProcedure.query(
  ({ ctx }) =>
    ctx.db.disqualificationMotive.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
);
