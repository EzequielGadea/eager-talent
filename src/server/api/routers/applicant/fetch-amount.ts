import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { Prisma } from "~/generated/prisma/client";
import { Source } from "~/generated/prisma/enums";
import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";
import { getApplicantSearchWhere } from "./search-where";

export const fetchAmount = protectedProcedure
  .input(
    z.object({
      seniorityId: z.array(z.string()).default([]),
      areaId: z.array(z.string()).default([]),
      jobOpeningId: z.array(z.string()).default([]),
      roleId: z.array(z.string()).default([]),
      tagId: z.array(z.string()).default([]),
      search: z.string().optional(),
      source: z.array(z.enum(Source)).default([]),
    }),
  )
  .query(async ({ ctx, input }) => {
    const canReadAllResult = await auth.api.hasPermission({
      headers: ctx.headers,
      body: { permissions: { applicant: ["read"] } },
    });

    const canReadAssignedResult = await auth.api.hasPermission({
      headers: ctx.headers,
      body: { permissions: { applicant: ["readAssigned"] } },
    });

    if (!canReadAllResult.success && !canReadAssignedResult.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tenés permiso para consultar candidatos",
      });
    }

    const accessWhere: Prisma.ApplicantWhereInput = canReadAllResult.success
      ? {}
      : {
          applications: {
            some: {
              active: true,
              jobOpening: {
                hiringManagers: {
                  some: {
                    id: ctx.session.user.id,
                  },
                },
              },
            },
          },
        };
    const searchWhere = getApplicantSearchWhere(input.search);
    const filtersWhere: Prisma.ApplicantWhereInput = {
      ...searchWhere,
      ...(input.roleId.length > 0 && {
        roleId: {
          in: input.roleId,
        },
      }),
      ...(input.seniorityId.length > 0 && {
        seniorityId: {
          in: input.seniorityId,
        },
      }),
      ...(input.areaId.length > 0 && {
        areaId: {
          in: input.areaId,
        },
      }),
      ...(input.jobOpeningId.length > 0 && {
        applications: {
          some: {
            active: true,
            jobOpeningId: {
              in: input.jobOpeningId,
            },
          },
        },
      }),
      ...(input.tagId.length > 0 && {
        tags: {
          some: {
            id: {
              in: input.tagId,
            },
          },
        },
      }),

      ...(input.source.length > 0 && {
        source: {
          in: input.source,
        },
      }),
    };

    const where: Prisma.ApplicantWhereInput = {
      AND: [accessWhere, filtersWhere],
    };

    try {
      return await ctx.db.applicant.count({
        where,
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unexpected prisma error",
        });
      }

      throw error;
    }
  });
