import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

export const fetchPipelineCandidates = protectedProcedure
  .input(
    z.object({
      jobOpeningId: z.string(),
      stageName: z.string(),
      limit: z.number().int().positive().max(50).default(3),
      offset: z.number().int().nonnegative().default(0),
    }),
  )
  .query(async ({ ctx, input }) => {
    const canReadAll = await auth.api.hasPermission({
      headers: ctx.headers,
      body: {
        permissions: {
          application: ["read"],
        },
      },
    });

    const canReadAssigned = await auth.api.hasPermission({
      headers: ctx.headers,
      body: {
        permissions: {
          application: ["readAssigned"],
        },
      },
    });

    if (!canReadAll.success && !canReadAssigned.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tienes permiso para consultar el pipeline",
      });
    }

    const where = {
      jobOpeningId: input.jobOpeningId,
      currentStage: input.stageName,
      active: true,
      ...(canReadAll.success
        ? {}
        : {
            jobOpening: {
              hiringManagers: {
                some: {
                  id: ctx.session.user.id,
                },
              },
            },
          }),
    };

    const [applications, total] = await Promise.all([
      ctx.db.application.findMany({
        where,
        orderBy: [
          {
            stageEntryDate: "desc",
          },
          {
            applicantId: "asc",
          },
        ],
        skip: input.offset,
        take: input.limit,
        select: {
          applicantId: true,
          applicant: {
            select: {
              name: true,
              lastName: true,
              photo: true,
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
      ctx.db.application.count({
        where,
      }),
    ]);

    const candidates = applications.map((application) => ({
      applicantId: application.applicantId,
      name: application.applicant.name,
      lastName: application.applicant.lastName,
      photo: application.applicant.photo,
      role: application.applicant.role.name,
    }));

    return {
      candidates,
      total,
      hasMore: input.offset + candidates.length < total,
      nextOffset: input.offset + candidates.length,
    };
  });