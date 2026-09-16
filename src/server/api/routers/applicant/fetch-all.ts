import { z } from "zod";

import { EnglishLevel, Source, HearAboutUs } from "~/generated/prisma/enums";

import { protectedProcedure } from "~/server/api/trpc";
import { Prisma } from "~/generated/prisma/client";
import { TRPCError } from "@trpc/server";

export const fetchAll = protectedProcedure
    .input(
        z.object({
            seniorityId: z.array(z.string()).default([]),
            areaId: z.array(z.string()).default([]),
            jobOpeningId: z.array(z.string()).default([]),
            roleId: z.array(z.string()).default([]),
            search: z.string().optional(),
            currentPage: z.number().default(1),
        })
    )
    .query(async ({ ctx, input }) => {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const where: Prisma.ApplicantWhereInput = {
            ...(input?.roleId && input.roleId.length > 0 && {
                roleId: {
                    in: input.roleId,
                },
            }),

            ...(input?.seniorityId && input.seniorityId.length > 0 && {
                seniorityId: {
                    in: input.seniorityId,
                },
            }),

            ...(input?.areaId && input.areaId.length > 0 && {
                areaId: {
                    in: input.areaId,
                },
            }),

            ...(input?.jobOpeningId && input.jobOpeningId.length > 0 && {
                applications: {
                    some: {
                        jobOpeningId: {
                            in: input.jobOpeningId,
                        },
                    },
                },
            }),

            ...(input?.search && {
                OR: [
                    {
                        name: {
                            contains: input.search,
                            mode: "insensitive",
                        },
                    },
                    {
                        lastName: {
                            contains: input.search,
                            mode: "insensitive",
                        },
                    },
                    {
                        email: {
                            contains: input.search,
                            mode: "insensitive",
                        },
                    },
                ],
            }),
        };

        const result = await ctx.db.applicant.findMany({
            where,
            skip: ((input?.currentPage ?? 1) - 1) * 8,
            take: 8,
            orderBy: {
                id: "asc",
            },
            include: {
                role: {
                    select: {
                        name: true,
                    }
                },
                tags: {
                    select: {
                        name: true,
                        color: true,
                    }
                },
                seniority: {
                    select: {
                        name: true,
                        color: true,
                    }
                },
                applications: {
                    include: {
                        jobOpening: {
                            select: {
                                name: true,
                            }
                        }
                    }
                },
                area: {
                    select: {
                        name: true,
                    }
                },
            },

        })
        console.log("antes de ir a front");
        return { applicants: result };
    })
