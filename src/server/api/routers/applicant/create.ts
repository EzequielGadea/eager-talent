import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
  EnglishLevel,
  Source,
  HearAboutUs,
  SalaryCurrency,
  JobOpeningStatus,
} from "~/generated/prisma/enums";
import { Prisma } from "~/generated/prisma/client";
import { auth } from "~/lib/auth";
import {
  applicantCountrySchema,
  applicantEmailSchema,
  applicantLinkedinSchema,
  applicantNameSchema,
  applicantTagIdsSchema,
  availabilitySchema,
  careerYearSchema,
  desiredSalarySchema,
  shortTextSchema,
  validateCareerYears,
} from "~/lib/validations/applicant";
import { optionalE164PhoneSchema } from "~/lib/validations/phone";
import { uploadthingUrlSchema } from "~/lib/validations/uploadthing-url";
import { protectedProcedure } from "~/server/api/trpc";

export const createApplicant = protectedProcedure
  .input(
    z
      .object({
        name: applicantNameSchema("El nombre"),
        lastname: applicantNameSchema("El apellido"),
        email: applicantEmailSchema,
        phone: optionalE164PhoneSchema,
        photo: uploadthingUrlSchema.optional(),
        country: applicantCountrySchema.optional(),
        linkedin: applicantLinkedinSchema.optional(),

        englishLevel: z.enum(EnglishLevel).optional(),
        source: z.enum(Source).optional(),
        hearAboutUs: z.enum(HearAboutUs).optional(),

        title: shortTextSchema("El título", 100).optional(),
        academicInstitution: shortTextSchema("La institución", 150).optional(),
        careerStartYear: careerYearSchema.optional(),
        careerEndYear: careerYearSchema.optional(),
        education: uploadthingUrlSchema.optional(),
        resume: uploadthingUrlSchema.optional(),

        roleId: z.string().min(1),
        areaId: z.string().min(1).optional(),
        seniorityId: z.string().min(1).optional(),
        jobOpeningId: z.string().min(1).optional(),
        desiredSalary: desiredSalarySchema.optional(),
        currency: z.enum(SalaryCurrency).optional(),
        availability: availabilitySchema.optional(),
        tagIds: applicantTagIdsSchema.default([]),
      })
      .superRefine((data, ctx) => {
        validateCareerYears(data, ctx);

        if (data.desiredSalary !== undefined && !data.currency) {
          ctx.addIssue({
            code: "custom",
            path: ["currency"],
            message: "Debe seleccionar una moneda",
          });
        }

        if (data.currency && data.desiredSalary === undefined) {
          ctx.addIssue({
            code: "custom",
            path: ["desiredSalary"],
            message: "Debe ingresar el salario deseado",
          });
        }
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
      const [role, area, seniority, tagsCount] = await Promise.all([
        ctx.db.jobRole.findUnique({
          where: { id: input.roleId },
          select: { id: true },
        }),
        input.areaId
          ? ctx.db.area.findUnique({
              where: { id: input.areaId },
              select: { id: true },
            })
          : Promise.resolve(true),
        input.seniorityId
          ? ctx.db.seniority.findUnique({
              where: { id: input.seniorityId },
              select: { id: true },
            })
          : Promise.resolve(true),
        ctx.db.tag.count({ where: { id: { in: input.tagIds } } }),
      ]);

      if (!role || !area || !seniority || tagsCount !== input.tagIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "El rol, área, seniority o tags seleccionados no existen",
        });
      }

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
              availability: input.availability || undefined,
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
