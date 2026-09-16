import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { z } from "zod";
//import { recruiterProcedure } from "~/server/api/trpc";
import { protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const fetchAll = protectedProcedure
  .input(
    z
      .object({
        //TODO agregar parametros para filtros, todos opcionales
        //<param1>: z.string().optional()
        currentPage: z.number(),
      })
      .optional(),
  )
  .query(async ({ ctx, input }) => {
    //delay para probar fallbacks, dejar
    //await new Promise((resolve) => setTimeout(resolve, 3000));
    /*
        try {
            //dato de prueba con muchos atributos faltantes
            const newApplicant = await ctx.db.applicant.create({
                data: {
                    id: '1',
                    name: 'martin',
                    lastName: "fossatti",
                    role: {
                        connect: {
                            id: "cmu1l7twf0000d9y61l89qj85",
                        }
                    }
                }
            });
        } catch (error) { console.log(error); }
        */
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
        //agregar filtros a la consulta
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
