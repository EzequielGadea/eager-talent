import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { auth } from "~/lib/auth";
import { isHiringManagerAssignedToJobOpening } from "~/server/api/procedures/is-hiring-manager-assigned-to-job-opening";
import { protectedProcedure } from "~/server/api/trpc";

export const getAllJobOpenings = protectedProcedure
  .input(z.object({}))
  .query(async ({ ctx }) => {
    const [canReadAllResult, canReadAssignedResult] = await Promise.all([
      auth.api.hasPermission({
        headers: ctx.headers,
        body: {
          permissions: {
            jobOpening: ["read"],
          },
        },
      }),
      auth.api.hasPermission({
        headers: ctx.headers,
        body: {
          permissions: {
            jobOpening: ["readAssigned"],
          },
        },
      }),
    ]);

    if (!canReadAllResult.success && !canReadAssignedResult.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tenés permiso para consultar vacantes",
      });
    }

    const where = canReadAllResult.success
      ? {}
      : isHiringManagerAssignedToJobOpening(ctx.session.user.id);

    return ctx.db.jobOpening.findMany({
      where,
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  });