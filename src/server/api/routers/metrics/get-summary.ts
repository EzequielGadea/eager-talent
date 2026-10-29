import { metricsFilterSchema } from "~/lib/validations/metrics";
import { protectedProcedure } from "~/server/api/trpc";
import { authorizeRecruiter } from "./authorize-recruiter";
import { getMetricsJobOpeningWhere } from "./filter";

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

export const getMetricsSummary = protectedProcedure
  .input(metricsFilterSchema)
  .query(async ({ ctx, input }) => {
    await authorizeRecruiter(ctx);

    const jobOpeningWhere = getMetricsJobOpeningWhere(input);

    const [motiveCounts, sourceApplications] = await Promise.all([
      ctx.db.application.groupBy({
        by: ["disqualificationMotiveId"],
        where: {
          active: false,
          deletedAt: null,
          jobOpening: jobOpeningWhere,
        },
        _count: { _all: true },
      }),
      ctx.db.application.findMany({
        where: {
          active: true,
          deletedAt: null,
          jobOpening: jobOpeningWhere,
          applicant: { deletedAt: null },
        },
        select: {
          applicant: {
            select: { hearAboutUs: true },
          },
        },
      }),
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
      .map(({ disqualificationMotiveId, _count }) => {
        const name = disqualificationMotiveId
          ? (motiveNames.get(disqualificationMotiveId) ??
            "Sin motivo registrado")
          : "Sin motivo registrado";

        return {
          name,
          count: _count._all,
          percentage: totalDisqualified
            ? (_count._all / totalDisqualified) * 100
            : 0,
        };
      })
      .sort((first, second) => second.count - first.count);

    const sourceCounts = new Map<string | null, number>();
    for (const application of sourceApplications) {
      const source = application.applicant.hearAboutUs;
      sourceCounts.set(source, (sourceCounts.get(source) ?? 0) + 1);
    }

    const totalApplications = sourceApplications.length;
    const applicationSources = Array.from(
      sourceCounts,
      ([hearAboutUs, count]) => ({
        name: hearAboutUs
          ? (hearAboutUsLabels[hearAboutUs] ?? hearAboutUs)
          : "Sin especificar",
        count,
        percentage: totalApplications ? (count / totalApplications) * 100 : 0,
      }),
    ).sort((first, second) => second.count - first.count);

    return {
      totalApplications,
      totalDisqualified,
      disqualificationMotives,
      applicationSources,
    };
  });
