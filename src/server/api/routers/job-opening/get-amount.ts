import { TRPCError } from "@trpc/server";
import { TZDate } from "@date-fns/tz";
import { addWeeks, startOfWeek } from "date-fns";

import { auth } from "~/lib/auth";
import { isHiringManagerAssignedToJobOpening } from "~/server/api/procedures/is-hiring-manager-assigned-to-job-opening";
import { protectedProcedure } from "~/server/api/trpc";
import { getJobOpeningFilterWhere, jobOpeningFilterSchema } from "./filter";

export const getJobOpeningsAmount = protectedProcedure
  .input(jobOpeningFilterSchema)
  .query(async ({ ctx, input }) => {
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

    const accessWhere = canReadAllResult.success
      ? {}
      : isHiringManagerAssignedToJobOpening(ctx.session.user.id);

    const filteredWhere = {
      AND: [accessWhere, getJobOpeningFilterWhere(input)],
    };

    const now = new TZDate(Date.now(), "America/Montevideo");
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const nextWeekStart = addWeeks(weekStart, 1);

    const weekStartDate = new Date(
      Date.UTC(
        weekStart.getFullYear(),
        weekStart.getMonth(),
        weekStart.getDate(),
      ),
    );
    const nextWeekStartDate = new Date(
      Date.UTC(
        nextWeekStart.getFullYear(),
        nextWeekStart.getMonth(),
        nextWeekStart.getDate(),
      ),
    );

    const [total, open, paused, closed, cancelled, openedThisWeek] =
      await Promise.all([
        ctx.db.jobOpening.count({
          where: filteredWhere,
        }),

        ctx.db.jobOpening.count({
          where: {
            AND: [accessWhere, { status: "Open" }],
          },
        }),

        ctx.db.jobOpening.count({
          where: {
            AND: [accessWhere, { status: "Paused" }],
          },
        }),

        ctx.db.jobOpening.count({
          where: {
            AND: [accessWhere, { status: "Closed" }],
          },
        }),

        ctx.db.jobOpening.count({
          where: {
            AND: [accessWhere, { status: "Cancelled" }],
          },
        }),
        ctx.db.jobOpening.count({
          where: {
            AND: [
              accessWhere,
              {
                openingDate: {
                  gte: weekStartDate,
                  lt: nextWeekStartDate,
                },
              },
            ],
          },
        }),
      ]);

    return {
      total,
      open,
      paused,
      closed,
      cancelled,
      openedThisWeek,
    };
  });
