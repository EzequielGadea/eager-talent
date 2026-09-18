import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
  EnglishLevel,
  Source,
  HearAboutUs,
} from "~/generated/prisma/enums";

import { Prisma } from "~/generated/prisma/client";
import { protectedProcedure } from "~/server/api/trpc";

export const updateApplicant = protectedProcedure
  .input(
    z.object({
      id: z.string().min(1),

      name: z.string().min(1),
      lastname: z.string().min(1),
      email: z.string().optional(),
      phone: z.string().optional(),

      photo: z.string().nullable().optional(),

      country: z.string().optional(),
      linkedin: z.string().optional(),

      englishLevel: z.enum(EnglishLevel).optional(),
      source: z.enum(Source).optional(),
      hearAboutUs: z.enum(HearAboutUs).optional(),

      title: z.string().optional(),
      academicInstitution: z.string().optional(),
      careerStartYear: z.number().optional(),
      careerEndYear: z.number().optional(),

      education: z.string().nullable().optional(),
      resume: z.string().nullable().optional(),

      roleId: z.string().min(1),
      areaId: z.string().nullable().optional(),
      seniorityId: z.string().nullable().optional(),

      tagIds: z.array(z.string()),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    try {
      const applicant = await ctx.db.applicant.update({
        where: {
          id: input.id,
        },

        data: {
          name: input.name,
          lastName: input.lastname,
          email: input.email,
          phone: input.phone,
          photo: input.photo,
          country: input.country,
          linkedin: input.linkedin,

          englishLevel: input.englishLevel,
          source: input.source,
          hearAboutUs: input.hearAboutUs,

          title: input.title,
          academicInstitution: input.academicInstitution,
          careerStartYear: input.careerStartYear,
          careerEndYear: input.careerEndYear,

          education: input.education,
          resume: input.resume,

          role: {
            connect: {
              id: input.roleId,
            },
          },

          area:
            input.areaId === null
              ? {
                  disconnect: true,
                }
              : input.areaId
                ? {
                    connect: {
                      id: input.areaId,
                    },
                  }
                : undefined,

          seniority:
            input.seniorityId === null
              ? {
                  disconnect: true,
                }
              : input.seniorityId
                ? {
                    connect: {
                      id: input.seniorityId,
                    },
                  }
                : undefined,

          tags: {
            set: input.tagIds.map((id) => ({
              id,
            })),
          },
        },
      });

      return applicant;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Ya existe un candidato con ese email",
        });
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Candidato no encontrado",
        });
      }

      throw error;
    }
  });