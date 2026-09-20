import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { auth } from "~/lib/auth";
import { isHiringManagerAssignedToApplicant } from "~/server/api/procedures/is-hiring-manager-assigned-to-applicant";
import { protectedProcedure } from "~/server/api/trpc";

export const getApplicantByIdProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string().min(1),
    }),
  )
  .query(async ({ input, ctx }) => {
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

    const applicant = await ctx.db.applicant.findFirst({
      where: {
        id: input.id,
        ...(canReadAllResult.success
          ? {}
          : isHiringManagerAssignedToApplicant(ctx.session.user.id)),
      },
      select: {
        id: true,
        name: true,
        lastName: true,
        email: true,
        phone: true,
        photo: true,
        country: true,
        linkedin: true,
        englishLevel: true,
        source: true,
        hearAboutUs: true,
        title: true,
        academicInstitution: true,
        careerStartYear: true,
        careerEndYear: true,
        education: true,
        resume: true,
        role: { select: { id: true, name: true } },
        area: { select: { id: true, name: true } },
        seniority: { select: { id: true, name: true } },
        tags: { select: { id: true, name: true, color: true } },
      },
    });

    if (!applicant) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Candidato no encontrado",
      });
    }

    return applicant;
  });
