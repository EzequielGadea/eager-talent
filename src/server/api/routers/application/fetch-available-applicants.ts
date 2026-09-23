import { headers } from "next/headers";
import { z } from "zod";

import { TRPCError } from "@trpc/server";

import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

export const fetchAvailableApplicants = protectedProcedure
  .input(
    z.object({
      jobOpeningId: z.string(),
      search: z.string().trim().optional(),
      limit: z.number().int().min(1).max(10).default(10),
      offset: z.number().int().min(0).default(0),
    }),
  )
  .query(async ({ ctx, input }) => {
    const permission = await auth.api.hasPermission({
      headers: await headers(),
      body: {
        permissions: {
          applicant: ["read"],
          application: ["create"],
        },
      },
    });

    if (!permission.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
      });
    }

    const searchTerms = input.search?.trim().split(/\s+/).filter(Boolean) ?? [];

    const applicants = await ctx.db.applicant.findMany({
      where: {
        applications: {
          none: {
            jobOpeningId: input.jobOpeningId,
          },
        },
        ...(searchTerms.length > 0
          ? {
              AND: searchTerms.map((term) => ({
                OR: [
                  {
                    name: {
                      contains: term,
                      mode: "insensitive",
                    },
                  },
                  {
                    lastName: {
                      contains: term,
                      mode: "insensitive",
                    },
                  },
                  {
                    email: {
                      contains: term,
                      mode: "insensitive",
                    },
                  },
                ],
              })),
            }
          : {}),
      },
      orderBy: [
        {
          name: "asc",
        },
        {
          lastName: "asc",
        },
      ],
      skip: input.offset,
      take: input.limit + 1,
      select: {
        id: true,
        name: true,
        lastName: true,
        email: true,
        photo: true,
        title: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    const hasMore = applicants.length > input.limit;
    const visibleApplicants = hasMore
      ? applicants.slice(0, input.limit)
      : applicants;

    return {
      applicants: visibleApplicants,
      hasMore,
      nextOffset: input.offset + visibleApplicants.length,
    };
  });
