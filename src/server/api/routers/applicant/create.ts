import { z } from "zod";

import { EnglishLevel, Source, HearAboutUs } from "~/generated/prisma/enums";

import { protectedProcedure } from "~/server/api/trpc";
import { Prisma } from "~/generated/prisma/client";
import { TRPCError } from "@trpc/server";

export const createApplicant = protectedProcedure
  .input(
    z.object({
      name: z.string().min(1),
      lastname: z.string().min(1),
      email: z.string().optional(),
      phone: z.string().optional(),
      photo: z.string().optional(),
      country: z.string().optional(),
      linkedin: z.string().optional(),

      englishLevel: z.enum(EnglishLevel).optional(),
      source: z.enum(Source).optional(),
      hearAboutUs: z.enum(HearAboutUs).optional(),

      title: z.string().optional(),
      academicInstitution: z.string().optional(),
      careerStartYear: z.number().optional(),
      careerEndYear: z.number().optional(),
      education: z.string().optional(),
      resume: z.string().optional(),

      roleId: z.string(),
      areaId: z.string().optional(),
      seniorityId: z.string().optional(),
      jobOpeningId: z.string().optional(),
      // desiredSalary: z.number().positive().optional().or(z.literal("")),
      desiredSalary: z.string().optional(),
      currency: z.string().optional(),
      availability: z.string().optional(),
      tagIds: z.array(z.string()).default([]),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    try {
      let firstStage: string | undefined;

      // Si se seleccionó una vacante, buscamos su primera stage
      if (input.jobOpeningId) {
        const jobOpening = await ctx.db.jobOpening.findUnique({
          where: {
            id: input.jobOpeningId,
          },
          select: {
            stages: true,
          },
        });

        if (!jobOpening) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "La vacante seleccionada no existe",
          });
        }

        const stages = jobOpening.stages as Array<{ name: string }>;

        firstStage = stages[0]?.name;

        if (!firstStage) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "La vacante seleccionada no tiene stages configuradas",
          });
        }

        console.log("PRIMERA STAGE:", firstStage);
      }

      // Primero creamos el candidato
      const applicant = await ctx.db.$transaction(async (tx) => {
        const applicant = await tx.applicant.create({
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

            area: input.areaId
              ? {
                  connect: {
                    id: input.areaId,
                  },
                }
              : undefined,

            seniority: input.seniorityId
              ? {
                  connect: {
                    id: input.seniorityId,
                  },
                }
              : undefined,

            tags: {
              connect: input.tagIds.map((id) => ({
                id,
              })),
            },
          },
        });

        if (input.jobOpeningId && firstStage) {
          await tx.application.create({
            data: {
              applicantId: applicant.id,
              jobOpeningId: input.jobOpeningId,
              currentStage: firstStage,
              //Cambiar cuando cambie la base
              desiredSalary: input.desiredSalary,
              // Agregar cuando cambie la base : currency: input.currency,
              availability: input.availability,
            },
          });
        }

        return applicant;
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

      throw error;
    }
  });
