import { TRPCError } from "@trpc/server";

import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";
import { parseStages } from "~/lib/validations/job-opening";

import { TZDate } from "@date-fns/tz";
import { addDays, startOfDay } from "date-fns";

export const getTodayInterview = protectedProcedure.query(async ({ ctx }) => {
  const [canRead] = await Promise.all([
    auth.api.hasPermission({
      headers: ctx.headers,
      body: { permissions: { interview: ["read"] } },
    }),
  ]);

  if (!canRead.success) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "No tenés permiso para consultar entrevistas",
    });
  }

  const now = new TZDate(Date.now(), "America/Montevideo");
  const todayStart = startOfDay(now);
  const tomorrowStart = addDays(todayStart, 1);

  const interviews = await ctx.db.interview.findMany({
    where: {
      date: {
        gte: todayStart,
        lt: tomorrowStart,
      },
    },
    select: {
      id: true,
      date: true,
      stageId: true,
      modality: true,
      applicant: {
        select: {
          id: true,
          name: true,
          lastName: true,
          photo: true,
          title: true,
        },
      },
      application: {
        select: {
          jobOpening: { select: { id: true, name: true, stages: true } },
        },
      },
      interviewers: {
        select: { id: true, name: true, lastName: true },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { date: "asc" },
  });

  return {
    interviews: interviews.map((interview) => {
      const { application, stageId, ...rest } = interview;
      const stage = stageId
        ? parseStages(application?.jobOpening.stages).find(
            (candidate) => candidate.key === stageId,
          )
        : undefined;
      const label = stage?.name.replace(/^entrevista\s*/i, "").trim();

      return {
        ...rest,
        stageId,
        stageName: label
          ? label.charAt(0).toLocaleUpperCase("es") + label.slice(1)
          : stageId
            ? "Entrevista"
            : "Exploratoria",
        application: application
          ? {
              jobOpening: {
                id: application.jobOpening.id,
                name: application.jobOpening.name,
              },
            }
          : null,
      };
    }),
  };
});
