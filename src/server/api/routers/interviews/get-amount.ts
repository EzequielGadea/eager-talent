import { TRPCError } from "@trpc/server";
import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";
import { TZDate } from "@date-fns/tz";
import { addWeeks, startOfWeek, startOfDay, addDays } from "date-fns";
import { InterviewStatus } from "~/generated/prisma/enums";

export const getInterviewAmount = protectedProcedure.query(async ({ ctx }) => {
  const [canReadAllResult] = await Promise.all([
    auth.api.hasPermission({
      headers: ctx.headers,
      body: { permissions: { interview: ["read"] } },
    }),
  ]);

  if (!canReadAllResult.success) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "No tenés permiso para consultar entrevistas",
    });
  }
  const now = new TZDate(Date.now(), "America/Montevideo");
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const nextWeekStart = addWeeks(weekStart, 1);
  const todayStart = startOfDay(now);
  const tomorrowStart = addDays(todayStart, 1);
  const [amount, today] = await Promise.all([
    ctx.db.interview.count({
      where: {
        deletedAt: null,
        applicant: { deletedAt: null },
        OR: [
          { jobOpeningId: null },
          {
            application: {
              is: {
                jobOpening: {
                  status: "Open",
                },
              },
            },
          },
        ],
        date: {
          gte: weekStart,
          lt: nextWeekStart,
        },
      },
    }),
    ctx.db.interview.count({
      where: {
        deletedAt: null,
        applicant: { deletedAt: null },
        OR: [
          { jobOpeningId: null },
          {
            application: {
              is: {
                jobOpening: {
                  status: "Open",
                },
              },
            },
          },
        ],
        date: {
          gte: todayStart,
          lt: tomorrowStart,
        },
        status: InterviewStatus.Completed,
      },
    }),
  ]);
  return { amount, today };
});
