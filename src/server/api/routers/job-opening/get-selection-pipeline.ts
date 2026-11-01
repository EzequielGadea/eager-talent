import { TRPCError } from "@trpc/server";

import { auth } from "~/lib/auth";
import {
  parseStages,
  isRequiredStageName,
} from "~/lib/validations/job-opening";
import { protectedProcedure } from "~/server/api/trpc";

function normalizeStageName(name: string) {
  return name
    .trim()
    .replace(/\s+/g, " ")
    .normalize("NFC")
    .toLocaleLowerCase("es");
}

export const getSelectionPipeline = protectedProcedure.query(
  async ({ ctx }) => {
    const [canReadAllResult] = await Promise.all([
      auth.api.hasPermission({
        headers: ctx.headers,
        body: { permissions: { jobOpening: ["read"] } },
      }),
    ]);

    if (!canReadAllResult.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tenés permiso para consultar vacantes",
      });
    }

    const jobOpenings = await ctx.db.jobOpening.findMany({
      where: {},
      select: {
        stages: true,
        applications: {
          where: {
            active: true,
            deletedAt: null,
            applicant: { deletedAt: null },
          },
          select: { currentStageId: true },
        },
      },
    });

    const stagesByName = new Map<
      string,
      { name: string; color: string; count: number }
    >();

    for (const jobOpening of jobOpenings) {
      const stages = parseStages(jobOpening.stages).filter((stage) =>
        isRequiredStageName(stage.name),
      );
      const stageById = new Map(stages.map((stage) => [stage.key, stage]));

      for (const stage of stages) {
        const key = normalizeStageName(stage.name);
        if (!stagesByName.has(key)) {
          stagesByName.set(key, {
            name: stage.name,
            color: stage.color,
            count: 0,
          });
        }
      }

      for (const application of jobOpening.applications) {
        const stage = stageById.get(application.currentStageId);
        if (!stage) continue;

        const aggregate = stagesByName.get(normalizeStageName(stage.name));
        if (aggregate) aggregate.count += 1;
      }
    }

    return [...stagesByName.values()];
  },
);
