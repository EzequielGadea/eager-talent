import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { auth } from "~/lib/auth";
import { isHiringManagerAssignedToCandidate } from "~/server/api/procedures/is-hiring-manager-assigned-to-candidate";
import { protectedProcedure } from "~/server/api/trpc";

export const getActivitiesByCandidateIdProcedure = protectedProcedure
  .input(
    z.object({
      candidateId: z.string().min(1),
      page: z.number().int().positive().default(1),
      jobOpeningId: z.string().trim().min(1).optional(),
    }),
  )
  .query(async ({ input, ctx }) => {
    const [canViewLogsResult, canReadAllResult, canReadAssignedResult] =
      await Promise.all([
        auth.api.hasPermission({
          headers: ctx.headers,
          body: { permissions: { activity: ["read"] } },
        }),
        auth.api.hasPermission({
          headers: ctx.headers,
          body: { permissions: { applicant: ["read"] } },
        }),
        auth.api.hasPermission({
          headers: ctx.headers,
          body: { permissions: { applicant: ["readAssigned"] } },
        }),
      ]);

    if (!canViewLogsResult.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tenés permiso para consultar los logs del candidato",
      });
    }

    if (!canReadAllResult.success && !canReadAssignedResult.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tenés permiso para consultar candidatos",
      });
    }

    const candidate = await ctx.db.applicant.findFirst({
      where: {
        id: input.candidateId,
        ...(canReadAllResult.success
          ? {}
          : isHiringManagerAssignedToCandidate(ctx.session.user.id)),
      },
      select: { id: true },
    });

    if (!candidate) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Candidato no encontrado",
      });
    }

    const where = {
      applicantId: input.candidateId,
      ...(input.jobOpeningId ? { jobOpeningId: input.jobOpeningId } : {}),
    };
    const [applications, total] = await Promise.all([
      ctx.db.application.findMany({
        where: { applicantId: input.candidateId },
        select: { jobOpeningId: true, jobOpening: { select: { name: true } } },
        orderBy: [{ jobOpening: { name: "asc" } }, { jobOpeningId: "asc" }],
      }),
      ctx.db.activity.count({ where }),
    ]);

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

    const pageSize = 6;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(input.page, totalPages);
    const activities = await ctx.db.activity.findMany({
      where,
      select: {
        id: true,
        description: true,
        date: true,
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
