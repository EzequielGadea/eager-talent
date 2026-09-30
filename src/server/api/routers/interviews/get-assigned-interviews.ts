import { TRPCError } from "@trpc/server";

import { auth } from "~/lib/auth";
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

    return ctx.db.interview.findMany({
      where: {
        interviewers: {
          some: {
            id: ctx.session.user.id,
          },
        },
      },

      select: {
        id: true,
        name: true,
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
              },
            },
          },
        },
      },

      orderBy: {
        date: "asc",
      },
    });
  },
);