import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

export const updateOrderSeniority = protectedProcedure
  .input(
    z.object({
      seniorities: z.array(
        z.object({
          id: z.string().min(1),
          name: z.string().min(1),
          order: z.number(),
        }),
      ),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const permission = await auth.api.hasPermission({
      headers: ctx.headers,
      body: {
        permissions: {
          seniority: ["update"],
        },
      },
    });

    if (!permission.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tenés permisos para editar seniorities",
      });
    }

    return ctx.db.$transaction(
      input.seniorities.map((seniority) =>
        ctx.db.seniority.update({
          where: { id: seniority.id },
          data: { order: seniority.order },
        }),
      ),
    );
  });
