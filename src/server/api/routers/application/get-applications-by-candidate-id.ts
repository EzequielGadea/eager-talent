import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

export const getApplicationsByCandidateIdProcedure = protectedProcedure
  .input(
    z.object({
      candidateId: z.string().min(1),
    }),
  )
  .query(async ({ input, ctx }) => {
    const [canReadAllResult, canReadAssignedResult] = await Promise.all([
      auth.api.hasPermission({
        headers: ctx.headers,
        body: { permissions: { application: ["read"] } },
      }),
      auth.api.hasPermission({
        headers: ctx.headers,
        body: { permissions: { application: ["readAssigned"] } },
      }),
    ]);

    if (!canReadAllResult.success && !canReadAssignedResult.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tenés permiso para consultar postulaciones",
      });
    }

    return ctx.db.application.findMany({
      where: {
        applicantId: input.candidateId,
        ...(canReadAllResult.success
          ? {}
          : {
              jobOpening: {
                hiringManagers: { some: { id: ctx.session.user.id } },
              },
            }),
      },
      orderBy: {
        applicationDate: "desc",
      },
      include: {
        jobOpening: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  });
