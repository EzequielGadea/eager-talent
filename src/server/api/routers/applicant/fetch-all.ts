import { z } from "zod";

import { EnglishLevel, Source, HearAboutUs } from "~/generated/prisma/enums";

import { protectedProcedure } from "~/server/api/trpc";
import { Prisma } from "~/generated/prisma/client";
import { TRPCError } from "@trpc/server";

export const fetchAll = protectedProcedure
    .input(
        z.object({ //TODO agregar parametros para filtros, todos opcionales
            //<param1>: z.string().optional()
            //<param2>: z.number()
        }).optional()
    )
    .query(async ({ctx, input}) => {
        //await new Promise((resolve) => setTimeout(resolve, 3000));
        /*
        try {
            //dato de prueba basura
            const newApplicant = await prisma.applicant.create({
                data: {
                    id: '1',
                    name: 'martin',
                    lastName: "fossatti",
                    role: {
                        connect: {
                            id: "cmtroqosn0000l5y6ppaym3pq",
                        }
                    }
                }
            });
        } catch (error) { console.log(error); }
        */
        const result = await ctx.db.applicant.findMany({
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
                    jobOpening : {
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
        //agregar filtros a la consulta
    })
        console.log("antes de ir a front");
        return {applicants: result};
    })
