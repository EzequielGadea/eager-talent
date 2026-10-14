import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { persistedStageSchema } from "~/lib/validations/job-opening";
import { protectedProcedure } from "~/server/api/trpc";

export const getDefault = protectedProcedure.query(async ({ ctx }) => {
  const template = await ctx.db.stageTemplate.findFirst({
    select: { stages: true, id: true },
  });

  if (!template) {
    throw new TRPCError({ code: "NOT_FOUND" });
  }
  const stages = z.array(persistedStageSchema).parse(template.stages);
  return { id: template?.id, stages };
});
