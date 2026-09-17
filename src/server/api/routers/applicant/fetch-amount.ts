import { z } from 'zod';

import { protectedProcedure } from '~/server/api/trpc';

export const fetchAmount = protectedProcedure
    .input(
        z.object({
            seniorityId: z.array(z.string()).default([]),
            areaId: z.array(z.string()).default([]),
            jobOpeningId: z.array(z.string()).default([]),
            roleId: z.array(z.string()).default([]),
            tagId: z.array(z.string()).default([]),
            search: z.string().optional(),
        }),
    )
    .query(async ({ ctx, input }) => {
        return ctx.db.applicant.count({
            where: {
                ...(input.roleId.length > 0 && {
                    roleId: { in: input.roleId },
                }),
                ...(input.seniorityId.length > 0 && {
                    seniorityId: { in: input.seniorityId },
                }),
                ...(input.areaId.length > 0 && {
                    areaId: { in: input.areaId },
                }),
                ...(input.jobOpeningId.length > 0 && {
                    applications: {
                        some: {
                            jobOpeningId: { in: input.jobOpeningId },
                        },
                    },
                }),
                ...(input.tagId.length > 0 && {
                    tags: {
                        some: {
                            id: { in: input.tagId },
                        },
                    },
                }),
                ...(input.search && {
                    OR: [
                        { name: { contains: input.search, mode: 'insensitive' } },
                        { lastName: { contains: input.search, mode: 'insensitive' } },
                        { email: { contains: input.search, mode: 'insensitive' } },
                    ],
                }),
            },
        });
    });
