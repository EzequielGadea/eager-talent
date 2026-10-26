import { protectedProcedure } from "~/server/api/trpc";
import { authorizeRecruiter } from "./authorize-recruiter";

const hearAboutUsLabels: Record<string, string> = {
  LinkedInPost: "Publicación de LinkedIn",
  LinkedInJobs: "Empleos de LinkedIn",
  JobBoard: "Portal de empleo",
  Referral: "Recomendación",
  AiRecommendation: "Recomendación de IA",
  InternetSearch: "Búsqueda en internet",
  RecruiterContact: "Contacto de recruiter",
  Other: "Otro",
};

type SourceCount = {
  hearAboutUs: string | null;
  count: number;
};

export const getMetricsSummary = protectedProcedure.query(async ({ ctx }) => {
  await authorizeRecruiter(ctx);

  const [motiveCounts, sourceCounts] = await Promise.all([
    ctx.db.application.groupBy({
      by: ["disqualificationMotiveId"],
      where: {
        disqualificationMotiveId: { not: null },
      },
      _count: { _all: true },
    }),
    ctx.db.$queryRaw<SourceCount[]>`
      SELECT
        applicant.hear_about_us AS "hearAboutUs",
        COUNT(*)::int AS count
      FROM applicant
      GROUP BY applicant.hear_about_us
    `,
  ]);

  const motiveIds = motiveCounts.flatMap(({ disqualificationMotiveId }) =>
    disqualificationMotiveId ? [disqualificationMotiveId] : [],
  );
  const motives = motiveIds.length
    ? await ctx.db.disqualificationMotive.findMany({
        where: { id: { in: motiveIds } },
        select: { id: true, name: true },
      })
    : [];
  const motiveNames = new Map(motives.map(({ id, name }) => [id, name]));

  const totalDisqualified = motiveCounts.reduce(
    (total, motive) => total + motive._count._all,
    0,
  );
  const disqualificationMotives = motiveCounts
    .flatMap(({ disqualificationMotiveId, _count }) => {
      if (!disqualificationMotiveId) return [];
      const name = motiveNames.get(disqualificationMotiveId);
      if (!name) return [];

      return [
        {
          name,
          count: _count._all,
          percentage: totalDisqualified
            ? (_count._all / totalDisqualified) * 100
            : 0,
        },
      ];
    })
    .sort((first, second) => second.count - first.count);

  const totalApplications = sourceCounts.reduce(
    (total, source) => total + source.count,
    0,
  );
  const applicationSources = sourceCounts
    .map(({ hearAboutUs, count }) => ({
      name: hearAboutUs
        ? (hearAboutUsLabels[hearAboutUs] ?? hearAboutUs)
        : "Sin especificar",
      count,
      percentage: totalApplications ? (count / totalApplications) * 100 : 0,
    }))
    .sort((first, second) => second.count - first.count);

  return {
    totalApplications,
    totalDisqualified,
    disqualificationMotives,
    applicationSources,
  };
});
