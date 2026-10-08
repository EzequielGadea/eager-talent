import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "~/server/api/trpc";

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

export const updateDefault = protectedProcedure
  .input(
    z.object({
      id: z.string().min(1),
      stages: stagesSchema,
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const template = await ctx.db.stageTemplate.findFirst({
      where: { id: input.id, deletedAt: null },
      select: { id: true },
    });

    if (!template) {
      throw new TRPCError({ code: "NOT_FOUND" });
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
