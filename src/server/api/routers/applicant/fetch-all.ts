import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

export const fetchAll = protectedProcedure
  .input(
    z
      .object({
        currentPage: z.number(),
      })
      .optional(),
  )
  .query(async ({ ctx, input }) => {
    const canListApplicantsResult = await auth.api.hasPermission({
      headers: ctx.headers,
      body: { permissions: { applicant: ["read"] } },
    });

    if (!canListApplicantsResult.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Solo los reclutadores pueden consultar candidatos",
      });
    }

    try {
      const result = await ctx.db.applicant.findMany({
        skip: ((input?.currentPage ?? 1) - 1) * 8,
        take: 8,
        orderBy: {
          id: "asc",
        },
        include: {
          role: {
            select: {
              name: true,
            },
          },
          tags: {
            select: {
              name: true,
              color: true,
            },
          },
          seniority: {
            select: {
              name: true,
              color: true,
            },
          },
          applications: {
            include: {
              jobOpening: {
                select: {
                  name: true,
                },
              },
            },
          },
          area: {
            select: {
              name: true,
            },
          },
        },
      });

      return { applicants: result };
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unexpected prisma error",
        });
      }

      throw e;
    }
  });
