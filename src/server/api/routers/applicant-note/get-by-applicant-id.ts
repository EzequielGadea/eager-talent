import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { auth } from "~/lib/auth";
import { isHiringManagerAssignedToApplicant } from "~/server/api/procedures/is-hiring-manager-assigned-to-applicant";
import { protectedProcedure } from "~/server/api/trpc";

export const getApplicantNoteByApplicantIdProcedure = protectedProcedure
  .input(
    z.object({
      applicantId: z.string().min(1),
    }),
  )
  .query(async ({ ctx, input }) => {
    const [canReadAllResult, canReadAssignedResult] = await Promise.all([
      auth.api.hasPermission({
        headers: ctx.headers,
        body: { permissions: { applicant: ["read"] } },
      }),
      auth.api.hasPermission({
        headers: ctx.headers,
        body: { permissions: { applicant: ["readAssigned"] } },
      }),
    ]);

    if (!canReadAllResult.success && !canReadAssignedResult.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tenés permiso para consultar candidatos",
      });
    }

    const [applicant, note] = await Promise.all([
      ctx.db.applicant.findFirst({
        where: {
          id: input.applicantId,
          ...(canReadAllResult.success
            ? {}
            : isHiringManagerAssignedToApplicant(ctx.session.user.id)),
        },
        select: { id: true },
      }),
      ctx.db.applicantNote.findUnique({
        where: { applicantId: input.applicantId },
        select: {
          id: true,
          content: true,
          lastModified: true,
          applicantId: true,
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

    if (!applicant) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Candidato no encontrado",
      });
    }

    return note;
  });
