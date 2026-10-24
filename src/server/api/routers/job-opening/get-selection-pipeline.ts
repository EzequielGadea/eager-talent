import { TRPCError } from "@trpc/server";

import { auth } from "~/lib/auth";
import { parseStages } from "~/lib/validations/job-opening";
import { isHiringManagerAssignedToJobOpening } from "~/server/api/procedures/is-hiring-manager-assigned-to-job-opening";
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
    const [canReadAllResult, canReadAssignedResult] = await Promise.all([
      auth.api.hasPermission({
        headers: ctx.headers,
        body: { permissions: { jobOpening: ["read"] } },
      }),
      auth.api.hasPermission({
        headers: ctx.headers,
        body: { permissions: { jobOpening: ["readAssigned"] } },
      }),
    ]);

    if (!canReadAllResult.success && !canReadAssignedResult.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tenés permiso para consultar vacantes",
      });
    }

    const accessWhere = canReadAllResult.success
      ? {}
      : isHiringManagerAssignedToJobOpening(ctx.session.user.id);

    const jobOpenings = await ctx.db.jobOpening.findMany({
      where: {
        AND: [accessWhere, { status: "Open" }],
      },
      select: {
        stages: true,
        applications: {
          where: { active: true },
          select: { currentStageId: true },
        },
      },
    });

    const stagesByName = new Map<
      string,
      { name: string; color: string; count: number }
    >();

    for (const jobOpening of jobOpenings) {
      const stages = parseStages(jobOpening.stages);
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
