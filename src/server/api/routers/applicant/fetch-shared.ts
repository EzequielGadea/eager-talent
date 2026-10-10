import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { Prisma } from "~/generated/prisma/client";
import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";
import { getApplicantSearchWhere } from "./search-where";
export const fetchShared = protectedProcedure
  .input(
    z.object({
      page: z.number().int().min(1).default(1),
      search: z.string().optional(),
    }),
  )
  .query(async ({ ctx, input }) => {
    const canReadAssignedResult = await auth.api.hasPermission({
      headers: ctx.headers,
      body: {
        permissions: {
          applicant: ["readAssigned"],
        },
      },
    });

    if (!canReadAssignedResult.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tenés permiso para consultar candidatos compartidos",
      });
    }
    const searchWhere = getApplicantSearchWhere(input.search);
    const where: Prisma.ApplicantWhereInput = {
      AND: [
        {
          applicantHiringManagers: {
            some: {
              hiringManagerId: ctx.session.user.id,
            },
          },
        },
        {
          NOT: {
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
          },
        },
        searchWhere,
      ],
    };

    try {
      const applicants = await ctx.db.applicant.findMany({
        where,
        skip: (input.page - 1) * 8,
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
          area: {
            select: {
              name: true,
            },
          },

          applicantHiringManagers: {
            where: {
              hiringManagerId: ctx.session.user.id,
            },
            select: {
              viewedAt: true,
              sharedBy: {
                select: {
                  id: true,
                  name: true,
                  lastName: true,
                },
              },
            },
          },

          applications: {
            where: {
              active: true,
              jobOpening: {
                hiringManagers: {
                  some: {
                    id: ctx.session.user.id,
                  },
                },
              },
            },
            orderBy: {
              applicationDate: "desc",
            },
            include: {
              jobOpening: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      const total = await ctx.db.applicant.count({
        where,
      });

      return {
        applicants,
        total,
      };
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
