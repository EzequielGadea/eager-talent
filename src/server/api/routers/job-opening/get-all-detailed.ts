import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { auth } from "~/lib/auth";
import { isHiringManagerAssignedToJobOpening } from "~/server/api/procedures/is-hiring-manager-assigned-to-job-opening";
import { protectedProcedure } from "~/server/api/trpc";
import {
  defaultJobOpeningSort,
  getJobOpeningOrderBy,
  isApplicantCountSort,
  jobOpeningSortSchema,
} from "./sort";

import { getJobOpeningFilterWhere, jobOpeningFilterSchema } from "./filter";

const PAGE_SIZE = 8;

const jobOpeningSelect = {
  id: true,
  name: true,
  status: true,
  openingDate: true,

  area: {
    select: {
      id: true,
      name: true,
    },
  },

  hiringManagers: {
    select: {
      id: true,
      name: true,
      lastName: true,
    },
  },

  applications: {
    where: {
      active: true,
    },
    select: {
      currentStage: true,
    },
  },
} as const;

export const getAllJobOpeningsDetailed = protectedProcedure
  .input(
    jobOpeningFilterSchema.extend({
      page: z.number().int().min(1).default(1),
      sort: jobOpeningSortSchema.default(defaultJobOpeningSort),
    }),
  )
  .query(async ({ ctx, input }) => {
    const [canReadAllResult, canReadAssignedResult] = await Promise.all([
      auth.api.hasPermission({
        headers: ctx.headers,
        body: { permissions: { jobOpening: ["read"] } },
      }),
      auth.api.hasPermission({
        headers: ctx.headers,
        body: { permissions: { jobOpening: ["readAssigned"] } },
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

    const filterWhere = getJobOpeningFilterWhere(input);

    const where = {
      AND: [accessWhere, filterWhere],
    };

    const pageOffset = (input.page - 1) * PAGE_SIZE;

    const jobOpenings = isApplicantCountSort(input.sort)
      ? await findJobOpeningsOrderedByApplicantCount()
      : await ctx.db.jobOpening.findMany({
          where,
          skip: pageOffset,
          take: PAGE_SIZE,
          select: jobOpeningSelect,
          orderBy: getJobOpeningOrderBy(input.sort),
        });

    async function findJobOpeningsOrderedByApplicantCount() {
      const counts = await ctx.db.jobOpening.findMany({
        where,
        select: {
          id: true,
          _count: {
            select: {
              applications: {
                where: {
                  active: true,
                },
              },
            },
          },
        },
      });

      const direction = input.sort === "applicants-asc" ? 1 : -1;
      const pageIds = [...counts]
        .sort((first, second) => {
          const countDifference =
            first._count.applications - second._count.applications;

          if (countDifference !== 0) {
            return countDifference * direction;
          }

          return first.id.localeCompare(second.id);
        })
        .slice(pageOffset, pageOffset + PAGE_SIZE)
        .map((jobOpening) => jobOpening.id);

      if (pageIds.length === 0) {
        return [];
      }

      const pageJobOpenings = await ctx.db.jobOpening.findMany({
        where: {
          AND: [where, { id: { in: pageIds } }],
        },
        select: jobOpeningSelect,
      });

      const positionById = new Map(pageIds.map((id, index) => [id, index]));

      return [...pageJobOpenings].sort(
        (first, second) =>
          (positionById.get(first.id) ?? 0) -
          (positionById.get(second.id) ?? 0),
      );
    }

    return jobOpenings.map((jobOpening) => {
      const { applications, ...jobOpeningData } = jobOpening;

      return {
        ...jobOpeningData,

        applicants: applications.length,

        technicalInterviewApplicants: applications.filter(
          (application) => application.currentStage === "Entrevista Técnica",
        ).length,

        offeredApplicants: applications.filter(
          (application) => application.currentStage === "Oferta",
        ).length,
      };
    });
  });
