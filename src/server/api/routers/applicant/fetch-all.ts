import { z } from 'zod';

import { Prisma } from '~/generated/prisma/client';
import { protectedProcedure } from '~/server/api/trpc';

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
        }),
    )
    .query(async ({ ctx, input }) => {
        const where: Prisma.ApplicantWhereInput = {
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
            ...(input.search && {
                OR: [
                    {
                        name: {
                            contains: input.search,
                            mode: 'insensitive',
                        },
                    },
                    {
                        lastName: {
                            contains: input.search,
                            mode: 'insensitive',
                        },
                    },
                    {
                        email: {
                            contains: input.search,
                            mode: 'insensitive',
                        },
                    },
                ],
            }),
        };

        const result = await ctx.db.applicant.findMany({
            where,
            skip: (input.page - 1) * 8,
            take: 8,
            orderBy: {
                id: 'asc',
            },
            include: {
                role: {
                    select: { name: true },
                },
                tags: {
                    select: { name: true, color: true },
                },
                seniority: {
                    select: { name: true, color: true },
                },
                applications: {
                    include: {
                        jobOpening: {
                            select: { name: true },
                        },
                    },
                },
                area: {
                    select: { name: true },
                },
            },
        });

        return { applicants: result };
    });
