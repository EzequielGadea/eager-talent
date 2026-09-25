import { TRPCError } from "@trpc/server";

import { auth } from "~/lib/auth";
import { isHiringManagerAssignedToJobOpening } from "~/server/api/procedures/is-hiring-manager-assigned-to-job-opening";
import { protectedProcedure } from "~/server/api/trpc";

export const getJobOpeningsAmount = protectedProcedure.query(
  async ({ ctx }) => {
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

    const [total, open, paused, closed, cancelled] = await Promise.all([
      ctx.db.jobOpening.count({
        where,
      }),

      ctx.db.jobOpening.count({
        where: {
          ...where,
          status: "Open",
        },
      }),

      ctx.db.jobOpening.count({
        where: {
          ...where,
          status: "Paused",
        },
      }),

      ctx.db.jobOpening.count({
        where: {
          ...where,
          status: "Closed",
        },
      }),

      ctx.db.jobOpening.count({
        where: {
          ...where,
          status: "Cancelled",
        },
      }),
    ]);

    return {
      total,
      open,
      paused,
      closed,
      cancelled,
    };
  },
);
