import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { auth } from "~/lib/auth";
import { getInterviewName } from "~/lib/get-interview-name";
import { isHiringManagerAssignedToInterview } from "~/server/api/procedures/is-hiring-manager-assigned-to-interview";
import { protectedProcedure } from "~/server/api/trpc";

export const getInterviewsByApplicantIdProcedure = protectedProcedure
  .input(
    z.object({
      applicantId: z.string().min(1),
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

    const interviews = await ctx.db.interview.findMany({
      where: {
        applicantId: input.applicantId,
        deletedAt: null,
        ...(canReadAllResult.success
          ? {}
          : isHiringManagerAssignedToInterview(ctx.session.user.id)),
      },
      orderBy: {
        date: "asc",
      },
      select: {
        id: true,
        exploratoryName: true,
        stageId: true,
        duration: true,
        modality: true,
        date: true,
        status: true,
        summary: true,
        applicantId: true,
        jobOpeningId: true,
        application: {
          select: { jobOpening: { select: { stages: true } } },
        },
        interviewers: {
          select: {
            id: true,
            name: true,
            lastName: true,
          },
        },
      },
    });

    return interviews.map(({ application, ...interview }) => ({
      ...interview,
      name: getInterviewName(interview, application?.jobOpening.stages),
    }));
  });
