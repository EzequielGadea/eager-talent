import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { parseStages } from "~/lib/validations/job-opening";
import { protectedProcedure } from "~/server/api/trpc";
import { authorizeRecruiter } from "./authorize-recruiter";

export const getPipeline = protectedProcedure
  .input(z.object({ jobOpeningId: z.string().min(1) }))
  .query(async ({ ctx, input }) => {
    await authorizeRecruiter(ctx);

    const jobOpening = await ctx.db.jobOpening.findFirst({
      where: { id: input.jobOpeningId, status: "Closed" },
      select: { id: true, name: true, stages: true },
    });

    if (!jobOpening) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No se encontró la vacante cerrada seleccionada",
      });
    }

    const stageCounts = await ctx.db.application.groupBy({
      by: ["currentStageId"],
      where: { jobOpeningId: jobOpening.id },
      _count: { _all: true },
    });
    const countByStage = new Map(
      stageCounts.map(({ currentStageId, _count }) => [
        currentStageId,
        _count._all,
      ]),
    );
    const configuredStages = parseStages(jobOpening.stages);
    const stages = configuredStages.map((stage, index) => {
      const count = countByStage.get(stage.key) ?? 0;
      const nextCount = configuredStages[index + 1]
        ? (countByStage.get(configuredStages[index + 1]!.key) ?? 0)
        : null;

      return {
        id: stage.key,
        name: stage.name,
        color: stage.color,
        count,
        conversion:
          nextCount === null || count === 0 ? null : (nextCount / count) * 100,
      };
    });
    const totalApplications = stageCounts.reduce(
      (total, stage) => total + stage._count._all,
      0,
    );
    const firstStageCount = stages[0]?.count ?? 0;
    const lastStageCount = stages.at(-1)?.count ?? 0;

    return {
      jobOpeningId: jobOpening.id,
      jobOpeningName: jobOpening.name,
      totalApplications,
      stages,
      globalConversion: firstStageCount
        ? (lastStageCount / firstStageCount) * 100
        : null,
    };
  });
