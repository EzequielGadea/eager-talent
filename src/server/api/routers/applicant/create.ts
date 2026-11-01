import { z } from "zod";

import {
  EnglishLevel,
  Source,
  HearAboutUs,
  SalaryCurrency,
  JobOpeningStatus,
} from "~/generated/prisma/enums";
import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";
import { Prisma } from "~/generated/prisma/client";
import { TRPCError } from "@trpc/server";

import { paises } from "~/lib/countries";

function parseUrl(value: string) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function isUploadthingUrl(value: string) {
  const url = parseUrl(value);
  return (
    url?.protocol === "https:" &&
    (url.hostname === "utfs.io" || url.hostname.endsWith(".ufs.sh"))
  );
}

function isLinkedinUrl(value: string) {
  const url = parseUrl(value);
  return (
    (url?.protocol === "https:" || url?.protocol === "http:") &&
    (url.hostname === "linkedin.com" || url.hostname.endsWith(".linkedin.com"))
  );
}

const uploadthingUrlSchema = z
  .string()
  .refine(
    isUploadthingUrl,
    "El archivo debe estar subido al servicio de archivos",
  );

const careerYearSchema = z.number().int().min(1900).max(2100);

export const createApplicant = protectedProcedure
  .input(
    z.object({
      name: z.string().min(1),
      lastname: z.string().min(1),
      email: z.email("Correo inválido").optional(),
      phone: z.string().optional(),
      photo: uploadthingUrlSchema.optional(),
      country: z
        .string()
        .refine(
          (value) =>
            value === "" || paises.some((pais) => pais.nombre === value),
          "País inválido",
        )
        .optional(),
      linkedin: z
        .string()
        .refine(
          (value) => value === "" || isLinkedinUrl(value),
          "Debe ingresar una URL de LinkedIn válida",
        )
        .optional(),

      englishLevel: z.enum(EnglishLevel).optional(),
      source: z.enum(Source).optional(),
      hearAboutUs: z.enum(HearAboutUs).optional(),

      title: z.string().optional(),
      academicInstitution: z.string().optional(),
      careerStartYear: careerYearSchema.optional(),
      careerEndYear: careerYearSchema.optional(),
      education: uploadthingUrlSchema.optional(),
      resume: uploadthingUrlSchema.optional(),

      roleId: z.string(),
      areaId: z.string().optional(),
      seniorityId: z.string().optional(),
      jobOpeningId: z.string().optional(),
      // desiredSalary: z.number().positive().optional().or(z.literal("")),
      desiredSalary: z.string().optional(),
      currency: z.enum(SalaryCurrency).optional(),
      availability: z.string().optional(),
      tagIds: z.array(z.string()).default([]),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const permission = await auth.api.hasPermission({
      headers: ctx.headers,
      body: {
        permissions: {
          applicant: ["create"],
        },
      },
    });

    if (!permission.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tenes permisos para crear un candidato",
      });
    }
    try {
      let firstStageId: string | undefined;
      let jobOpeningName: string | undefined;

      // Si se seleccionó una vacante, buscamos su primera stage
      if (input.jobOpeningId) {
        const jobOpening = await ctx.db.jobOpening.findUnique({
          where: {
            id: input.jobOpeningId,
          },
          select: {
            name: true,
            stages: true,
            status: true,
          },
        });

        if (!jobOpening) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "La vacante seleccionada no existe",
          });
        }

        if (jobOpening.status !== JobOpeningStatus.Open) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Solo se pueden postular candidatos a vacantes abiertas",
          });
        }

        const stages = jobOpening.stages as Array<{ key: string }>;

        jobOpeningName = jobOpening.name;
        firstStageId = stages[0]?.key;

        if (!firstStageId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "La vacante seleccionada no tiene stages configuradas",
          });
        }
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

        await tx.activity.create({
          data: {
            applicantId: applicant.id,
            jobOpeningId: null,
            createdById: ctx.session.user.id,
            description: "creó el candidato",
          },
        });

        if (
          input.jobOpeningId &&
          firstStageId &&
          jobOpeningName !== undefined
        ) {
          await tx.application.create({
            data: {
              applicantId: applicant.id,
              jobOpeningId: input.jobOpeningId,
              currentStageId: firstStageId,
              //Cambiar cuando cambie la base
              desiredSalaryAmount: input.desiredSalary,
              desiredSalaryCurrency: input.currency,
              // Agregar cuando cambie la base : currency: input.currency,
              availability: input.availability,
            },
          });

          await tx.activity.create({
            data: {
              applicantId: applicant.id,
              jobOpeningId: input.jobOpeningId,
              createdById: ctx.session.user.id,
              description: `agregó el candidato a "${jobOpeningName}"`,
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
