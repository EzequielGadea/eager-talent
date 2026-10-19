import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { Prisma } from "~/generated/prisma/client";
import { protectedProcedure } from "~/server/api/trpc";

export const createDescalificationMotive = protectedProcedure
  .input(
    z.object({
      name: z.string().trim().min(1, "El nombre es obligatorio."),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const existingMotive = await ctx.db.disqualificationMotive.findFirst({
      where: { name: { equals: input.name, mode: "insensitive" } },
      select: { id: true },
    });

    if (existingMotive) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Ya existe un motivo con ese nombre.",
      });
    }

    try {
      return await ctx.db.disqualificationMotive.create({
        data: { name: input.name },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Ya existe un motivo con ese nombre.",
        });
      }

      throw error;
    }
  });
