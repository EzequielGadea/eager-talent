import { TRPCError } from "@trpc/server";

import { auth } from "~/lib/auth";
import { getInterviewName } from "~/lib/get-interview-name";
import { protectedProcedure } from "~/server/api/trpc";

export const getAssignedInterviews = protectedProcedure.query(
  async ({ ctx }) => {
    const permission = await auth.api.hasPermission({
      headers: ctx.headers,
      body: {
        permissions: {
          interview: ["readAssigned"],
        },
      },
    });

    if (!permission.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tenés permiso para consultar entrevistas asignadas",
      });
    }

    const interviews = await ctx.db.interview.findMany({
      where: {
        assignments: {
          some: {
            interviewerId: ctx.session.user.id,
          },
        },
      },

      select: {
        id: true,
        exploratoryName: true,
        stageId: true,
        date: true,
        status: true,
        modality: true,

        applicant: {
          select: {
            id: true,
            name: true,
            lastName: true,
            photo: true,
          },
        },

        application: {
          select: {
            jobOpening: {
              select: {
                id: true,
                name: true,
                stages: true,
              },
            },
          },
        },
      },

      orderBy: {
        date: "asc",
      },
    });

    return interviews.map(({ exploratoryName, stageId, ...interview }) => ({
      ...interview,
      name: getInterviewName(
        { exploratoryName, stageId },
        interview.application?.jobOpening.stages,
      ),
    }));
  },
);
