import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { candidateUserProcedure } from "~/server/api/procedures/candidate-user";

export const getActivitiesByCandidateIdProcedure = candidateUserProcedure
  .input(
    z.object({
      candidateId: z.string().min(1),
      page: z.number().int().positive().default(1),
      jobOpeningId: z.string().trim().min(1).optional(),
    }),
  )
  .query(async ({ input, ctx }) => {
    const candidate = await ctx.db.applicant.findFirst({
      where: { id: input.candidateId, ...ctx.candidateAccessWhere },
      select: { id: true },
    });

    if (!candidate) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Candidato no encontrado",
      });
    }

    if (!ctx.candidatePermissions.canViewLogs) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tenés permiso para consultar los logs del candidato",
      });
    }

    const applications = await ctx.db.application.findMany({
      where: { applicantId: input.candidateId },
      select: { jobOpeningId: true, jobOpening: { select: { name: true } } },
      orderBy: [{ jobOpening: { name: "asc" } }, { jobOpeningId: "asc" }],
    });

    if (
      input.jobOpeningId &&
      !applications.some(
        (application) => application.jobOpeningId === input.jobOpeningId,
      )
    ) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Postulación no encontrada",
      });
    }

    const where = {
      applicantId: input.candidateId,
      ...(input.jobOpeningId ? { jobOpeningId: input.jobOpeningId } : {}),
    };
    const pageSize = 6;
    const total = await ctx.db.activity.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(input.page, totalPages);
    const activities = await ctx.db.activity.findMany({
      where,
      select: {
        id: true,
        description: true,
        date: true,
        jobOpeningId: true,
        application: {
          select: { jobOpening: { select: { name: true } } },
        },
      },
      orderBy: [{ date: "desc" }, { id: "desc" }],
      take: pageSize,
      skip: (page - 1) * pageSize,
    });

    return {
      activities,
      total,
      page,
      pageSize,
      totalPages,
      applications: applications.map((application) => ({
        jobOpeningId: application.jobOpeningId,
        name: application.jobOpening.name,
      })),
    };
  });
