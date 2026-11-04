import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { auth } from "~/lib/auth";
import { isHiringManagerAssignedToInterview } from "~/server/api/procedures/is-hiring-manager-assigned-to-interview";
import { protectedProcedure } from "~/server/api/trpc";

export const getInterviewNoteByInterviewIdProcedure = protectedProcedure
  .input(
    z.object({
      interviewId: z.string().min(1),
    }),
  )
  .query(async ({ ctx, input }) => {
    const [canReadAllResult, canReadAssignedResult] = await Promise.all([
      auth.api.hasPermission({
        headers: ctx.headers,
        body: { permissions: { interviewNote: ["read"] } },
      }),
      auth.api.hasPermission({
        headers: ctx.headers,
        body: { permissions: { interviewNote: ["readAssigned"] } },
      }),
    ]);

    if (!canReadAllResult.success && !canReadAssignedResult.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tenés permiso para consultar las notas de entrevistas",
      });
    }

    const [interview, note] = await Promise.all([
      ctx.db.interview.findFirst({
        where: {
          id: input.interviewId,
          deletedAt: null,
          ...(canReadAllResult.success
            ? {}
            : isHiringManagerAssignedToInterview(ctx.session.user.id)),
        },
        select: { id: true },
      }),
      ctx.db.interviewNote.findUnique({
        where: { interviewId: input.interviewId, deletedAt: null },
        select: {
          id: true,
          content: true,
          lastModified: true,
          interviewId: true,
          lastModifiedBy: {
            select: {
              id: true,
              name: true,
              lastName: true,
            },
          },
        },
      }),
    ]);

    if (!interview) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Entrevista no encontrada",
      });
    }

    return note;
  });
