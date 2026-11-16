import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { isRequiredStage } from "~/lib/required-stage-types";
import { persistedStagesSchema } from "~/lib/validations/job-opening";
import { permissionProcedure } from "~/server/api/trpc";

const stageSchema = z.object({
  key: z.string().min(1),
  name: z.string().trim().min(1).max(80),
  type: z.string().min(1),
  label: z.string().min(1),
  color: z.string().min(1),
});

const stagesSchema = z
  .array(stageSchema)
  .min(2, "El flujo debe tener al menos dos etapas")
  .superRefine((stages, ctx) => {
    if (new Set(stages.map((stage) => stage.key)).size !== stages.length) {
      ctx.addIssue({
        code: "custom",
        message: "Las etapas no pueden tener identificadores repetidos",
      });
    }

    const names = stages.map((stage) => stage.name.toLocaleLowerCase("es"));
    if (new Set(names).size !== names.length) {
      ctx.addIssue({
        code: "custom",
        message: "Las etapas no pueden tener nombres repetidos",
      });
    }
  });

export const updateDefault = permissionProcedure({ stageTemplate: ["update"] })
  .input(
    z.object({
      id: z.string().min(1),
      stages: stagesSchema,
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const template = await ctx.db.stageTemplate.findFirst({
      where: { id: input.id, deletedAt: null },
      select: { id: true, stages: true },
    });

    if (!template) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    const currentStages = persistedStagesSchema.parse(template.stages);
    const nextStagesByKey = new Map(
      input.stages.map((stage) => [stage.key, stage]),
    );

    const boundaryStages = [
      {
        current: currentStages[0],
        next: input.stages[0],
        position: "primera",
      },
      {
        current: currentStages.at(-1),
        next: input.stages.at(-1),
        position: "última",
      },
    ];

    for (const boundary of boundaryStages) {
      if (
        !boundary.current ||
        !boundary.next ||
        boundary.next.key !== boundary.current.key ||
        boundary.next.name !== boundary.current.name ||
        boundary.next.type !== boundary.current.type ||
        boundary.next.label !== boundary.current.label ||
        boundary.next.color !== boundary.current.color
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `La ${boundary.position} etapa no se puede mover, editar ni eliminar.`,
        });
      }
    }

    for (const requiredStage of currentStages) {
      if (!isRequiredStage(requiredStage)) continue;

      const nextStage = nextStagesByKey.get(requiredStage.key);
      if (!nextStage) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `No se puede eliminar la etapa obligatoria ${requiredStage.name}.`,
        });
      }

      if (
        nextStage.name !== requiredStage.name ||
        nextStage.type !== requiredStage.type ||
        nextStage.label !== requiredStage.label
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `No se puede editar la etapa obligatoria ${requiredStage.name}.`,
        });
      }
    }

    const updated = await ctx.db.stageTemplate.update({
      where: { id: template.id },
      data: {
        stages: input.stages,
        lastModified: new Date(),
      },
      select: { id: true },
    });

    return { id: updated.id };
  });
