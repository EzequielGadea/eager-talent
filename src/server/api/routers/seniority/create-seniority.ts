import { headers } from "next/headers";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

export const createSeniority = protectedProcedure
  .input(
    z.object({
      name: z.string().trim().min(1, "El nombre es obligatorio."),
      order: z.number(),
      color: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const permission = await auth.api.hasPermission({
      headers: await headers(),
      body: { permissions: { seniority: ["create"] } },
    });
    if (!permission.success) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    const seniority = await ctx.db.seniority.create({
      data: {
        name: input.name,
        order: input.order,
        color: input.color,
      },
    });
  });
