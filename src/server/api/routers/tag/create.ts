import { z } from "zod";

import {
  protectedProcedure,
} from "~/server/api/trpc";

export const createTag = protectedProcedure

    .input(
      z.object({
        name: z.string().min(1),
        color: z.string(),
        isSkill: z.boolean().default(false),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.tag.create({
        data: {
          name: input.name,
          color: input.color,
          isSkill: input.isSkill,
        },
      });
    });