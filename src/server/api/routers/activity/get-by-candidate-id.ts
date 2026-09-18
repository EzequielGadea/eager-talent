import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { auth } from "~/lib/auth";
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
    const [canViewLogsResult, canReadAllResult] = await Promise.all([
      auth.api.hasPermission({
        headers: ctx.headers,
        body: { permissions: { activity: ["read"] } },
      }),
      auth.api.hasPermission({
        headers: ctx.headers,
        body: { permissions: { applicant: ["read"] } },
      }),
    ]);

    if (!canViewLogsResult.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tenés permiso para consultar los logs del candidato",
      });
    }

    if (!canReadAllResult.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tenés permiso para consultar candidatos",
      });
    }

    const candidate = await ctx.db.applicant.findFirst({
      where: { id: input.candidateId },
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
        application: {
          select: { jobOpeningId: true },
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
    };
  });
