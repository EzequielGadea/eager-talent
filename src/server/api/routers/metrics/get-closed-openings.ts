import { metricsFilterSchema } from "~/lib/validations/metrics";
import { protectedProcedure } from "~/server/api/trpc";
import { authorizeRecruiter } from "./authorize-recruiter";
import { getMetricsJobOpeningWhere } from "./filter";

export const getClosedOpenings = protectedProcedure
  .input(metricsFilterSchema)
  .query(async ({ ctx, input }) => {
    await authorizeRecruiter(ctx);

    return ctx.db.jobOpening.findMany({
      where: getMetricsJobOpeningWhere(input),
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
  });
