import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "~/server/api/trpc";

const stageSchema = z.object({
  key: z.string(),
  name: z.string(),
  type: z.string(),
  label: z.string(),
});

export const getDefault = protectedProcedure
  .query(async ({ ctx }) => {
    const template = await ctx.db.stageTemplate.findFirst({
      //where: { default:true }, TODO forma de saber cual es la por defecto
      select: {stages:true, id:true}
    });
    
    if (!template) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }
    const stages = z.array(stageSchema).parse(template.stages)
    return {id: template?.id, stages,};
  });