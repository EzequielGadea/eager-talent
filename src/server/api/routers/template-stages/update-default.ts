import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  isRequiredStage,
  normalizeStageName,
  getRequiredStageType,
} from "~/lib/required-stage-types";
import {
  persistedStagesSchema,
  persistedStageTypeSchema,
} from "~/lib/validations/job-opening";
import { protectedProcedure } from "~/server/api/trpc";
import { auth } from "~/lib/auth";

import { getRequiredStageErrors } from "~/lib/validations/required-stages";

const stageSchema = z.object({
  key: z.string().min(1),
  name: z.string().trim().min(1).max(80),
  type: persistedStageTypeSchema,
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

    const names = stages.map((stage) => normalizeStageName(stage.name));
    if (new Set(names).size !== names.length) {
      ctx.addIssue({
        code: "custom",
        message: "Las etapas no pueden tener nombres repetidos",
      });
    }

    for (const message of getRequiredStageErrors(stages)) {
      ctx.addIssue({
        code: "custom",
        message,
      });
    }

    for (const stage of stages) {
      const expectedType = getRequiredStageType(stage.name);

      if (expectedType && stage.type !== expectedType) {
        ctx.addIssue({
          code: "custom",
          message: `La etapa ${stage.name} debe tener el tipo ${expectedType}.`,
        });
      }
    }
  });

export const updateDefault = protectedProcedure
  .input(
    z.object({
      id: z.string().min(1),
      stages: stagesSchema,
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const permission = await auth.api.hasPermission({
      headers: ctx.headers,
      body: {
        permissions: {
          stageTemplate: ["update"],
        },
      },
    });

    if (!permission?.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tienes permisos para actualizar el flujo por defecto.",
      });
    }

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
