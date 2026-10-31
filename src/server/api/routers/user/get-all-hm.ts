import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

export const getAllHiringManagers = protectedProcedure
  .input(z.object({}))
  .query(async ({ ctx }) => {
    const canReadUsers = await auth.api.hasPermission({
      headers: ctx.headers,
      body: {
        permissions: {
          user: ["read"],
        },
      },
    });

    if (!canReadUsers.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tenés permiso para consultar usuarios",
      });
    }

    const hiringManagers = await ctx.db.member.findMany({
      where: {
        role: "hiringManager",
        user: { deletedAt: null },
      },
      select: {
        user: {
          select: {
            id: true,
            name: true,
            lastName: true,
            image: true,
            _count: {
              select: {
                assignedJobOpenings: true,
              },
            },
          },
        },
      },
    });

    return hiringManagers.map((member) => member.user);
  });
