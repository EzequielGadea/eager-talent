import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { auth } from "~/lib/auth";
import { formatApplicantsCsv } from "~/lib/csv/format-applicants-csv";
import { protectedProcedure } from "~/server/api/trpc";

export const exportApplicants = protectedProcedure
  .input(z.object({}))
  .mutation(async ({ ctx }) => {
    const canReadAllResult = await auth.api.hasPermission({
      headers: ctx.headers,
      body: { permissions: { applicant: ["read"] } },
    });

    if (!canReadAllResult.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tenés permiso para exportar candidatos.",
      });
    }

    try {
      const applicants = await ctx.db.applicant.findMany({
        where: {
          deletedAt: null,
        },
        orderBy: [{ name: "asc" }, { lastName: "asc" }],
        select: {
          name: true,
          lastName: true,
          email: true,
          phone: true,
          country: true,
          linkedin: true,
          englishLevel: true,
          source: true,
          hearAboutUs: true,
          title: true,
          role: {
            select: {
              name: true,
            },
          },
          seniority: {
            select: {
              name: true,
            },
          },
          tags: {
            select: {
              name: true,
            },
            orderBy: {
              name: "asc",
            },
          },
        },
      });

      return {
        csv: formatApplicantsCsv(applicants),
        count: applicants.length,
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "No se pudieron exportar los candidatos.",
        cause: error,
      });
    }
  });

