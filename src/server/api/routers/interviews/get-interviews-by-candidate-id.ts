import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

export const getInterviewsByCandidateIdProcedure = protectedProcedure
  .input(
    z.object({
      candidateId: z.string().min(1),
    }),
  )
  .query(async ({ input, ctx }) => {
    const [canReadAllResult, canReadAssignedResult] = await Promise.all([
      auth.api.hasPermission({
        headers: ctx.headers,
        body: { permissions: { interview: ["read"] } },
      }),
      auth.api.hasPermission({
        headers: ctx.headers,
        body: { permissions: { interview: ["readAssigned"] } },
      }),
    ]);

    if (!canReadAllResult.success && !canReadAssignedResult.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tenés permiso para consultar entrevistas",
      });
    }

    return ctx.db.interview.findMany({
      where: {
        applicantId: input.candidateId,
        ...(canReadAllResult.success
          ? {}
          : {
              OR: [
                {
                  applicant: {
                    hiringManagers: {
                      some: { id: ctx.session.user.id },
                    },
                  },
                },
                {
                  application: {
                    jobOpening: {
                      hiringManagers: {
                        some: { id: ctx.session.user.id },
                      },
                    },
                  },
                },
              ],
            }),
      },
      orderBy: {
        date: "asc",
      },
      select: {
        id: true,
        name: true,
        duration: true,
        modality: true,
        date: true,
        status: true,
        summary: true,
        applicantId: true,
        jobOpeningId: true,
        interviewers: {
          select: {
            id: true,
            name: true,
            lastName: true,
          },
        },
      },
    });
  });
