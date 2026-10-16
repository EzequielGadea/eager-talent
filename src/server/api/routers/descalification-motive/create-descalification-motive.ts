//import { headers } from "next/headers";
import { z } from "zod";
//import { TRPCError } from "@trpc/server";
//import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

export const createDescalificationMotive = protectedProcedure
  .input(
    z.object({
      name: z.string().trim().min(1, "El nombre es obligatorio."),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    /*const permission = await auth.api.hasPermission({
      headers: await headers(),
      body: { permissions: { area: ["create"] } },
    });
    if (!permission.success) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }*/
    const motive = await ctx.db.disqualificationMotive.create({
      data: {
        name: input.name,
      },
    });

    return motive;
  });
