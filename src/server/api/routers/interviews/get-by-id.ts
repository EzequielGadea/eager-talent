import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { auth } from "~/lib/auth";
import { getInterviewName } from "~/lib/get-interview-name";
import { isHiringManagerAssignedToInterview } from "~/server/api/procedures/is-hiring-manager-assigned-to-interview";
import { protectedProcedure } from "~/server/api/trpc";

export const getInterviewByIdProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string().min(1),
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

    const interview = await ctx.db.interview.findFirst({
      where: {
        id: input.id,
        deletedAt: null,
        ...(canReadAllResult.success
          ? {}
          : isHiringManagerAssignedToInterview(ctx.session.user.id)),
      },
      select: {
        id: true,
        exploratoryName: true,
        stageId: true,
        date: true,
        duration: true,
        modality: true,
        applicantId: true,
        jobOpeningId: true,
        applicant: {
          select: { id: true, name: true, lastName: true, photo: true },
        },
        application: {
          select: {
            jobOpening: { select: { id: true, name: true, stages: true } },
          },
        },
        interviewers: {
          select: { id: true, name: true, lastName: true },
          orderBy: { name: "asc" },
        },
        assignments: {
          where: { interviewerId: ctx.session.user.id },
          select: {
            assignedBy: { select: { id: true, name: true, lastName: true } },
          },
        },
      },
    });

    if (!interview) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Entrevista no encontrada",
      });
    }

    const { application, exploratoryName, stageId, ...rest } = interview;

    return {
      ...rest,
      exploratoryName,
      stageId,
      name: getInterviewName(
        { exploratoryName, stageId },
        application?.jobOpening.stages,
      ),
      application: application && {
        jobOpening: {
          id: application.jobOpening.id,
          name: application.jobOpening.name,
        },
      },
      assignedBy: interview.assignments[0]?.assignedBy ?? null,
    };
  });
