import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { Prisma } from "~/generated/prisma/client";
import { Source } from "~/generated/prisma/enums";
import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

export const fetchAll = protectedProcedure
  .input(
    z.object({
      seniorityId: z.array(z.string()).default([]),
      areaId: z.array(z.string()).default([]),
      jobOpeningId: z.array(z.string()).default([]),
      roleId: z.array(z.string()).default([]),
      tagId: z.array(z.string()).default([]),
      search: z.string().optional(),
      page: z.number().int().min(1).default(1),
      source: z.array(z.enum(Source)).default([]),
    }),
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

    const where: Prisma.ApplicantWhereInput = {
      ...(input.roleId.length > 0 && { roleId: { in: input.roleId } }),
      ...(input.seniorityId.length > 0 && {
        seniorityId: { in: input.seniorityId },
      }),
      ...(input.areaId.length > 0 && { areaId: { in: input.areaId } }),
      ...(input.jobOpeningId.length > 0 && {
        applications: {
          some: {
            active: true,
            jobOpeningId: { in: input.jobOpeningId },
          },
        },
      }),
      ...(input.tagId.length > 0 && {
        tags: { some: { id: { in: input.tagId } } },
      }),
      ...(input.search && {
        OR: [
          { name: { contains: input.search, mode: "insensitive" } },
          { lastName: { contains: input.search, mode: "insensitive" } },
          { email: { contains: input.search, mode: "insensitive" } },
        ],
      }),
      ...(input.source.length > 0 && { source: { in: input.source } }),
    };

    try {
      const result = await ctx.db.applicant.findMany({
        where,
        skip: (input.page - 1) * 8,
        take: 8,
        orderBy: { id: "asc" },
        include: {
          role: { select: { name: true } },
          tags: { select: { name: true, color: true } },
          seniority: { select: { name: true, color: true } },
          applications: {
            where: { active: true },
            orderBy: { applicationDate: "desc" },
            include: { jobOpening: { select: { name: true } } },
          },
          area: { select: { name: true } },
        },
      });

      return { applicants: result };
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
