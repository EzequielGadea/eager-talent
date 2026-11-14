import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { auth } from "~/lib/auth";
import {
  applicantCountrySchema,
  applicantEmailSchema,
  applicantLinkedinSchema,
  applicantNameSchema,
  applicantTagIdsSchema,
  careerYearSchema,
  shortTextSchema,
  validateCareerYears,
} from "~/lib/validations/applicant";
import { optionalE164PhoneSchema } from "~/lib/validations/phone";

import { EnglishLevel, Source, HearAboutUs } from "~/generated/prisma/enums";

import { Prisma } from "~/generated/prisma/client";
import { protectedProcedure } from "~/server/api/trpc";
import { uploadthingUrlSchema } from "~/lib/validations/uploadthing-url";

export const updateApplicant = protectedProcedure
  .input(
    z
      .object({
        id: z.string().min(1),

        name: applicantNameSchema("El nombre"),
        lastname: applicantNameSchema("El apellido"),
        email: applicantEmailSchema.optional(),
        phone: optionalE164PhoneSchema,

        photo: uploadthingUrlSchema.nullable().optional(),

        country: applicantCountrySchema.optional(),
        linkedin: applicantLinkedinSchema.optional(),

        englishLevel: z.enum(EnglishLevel).nullable().optional(),
        source: z.enum(Source).nullable().optional(),
        hearAboutUs: z.enum(HearAboutUs).nullable().optional(),

        title: shortTextSchema("El título", 100).optional(),
        academicInstitution: shortTextSchema("La institución", 150).optional(),
        careerStartYear: careerYearSchema.nullable().optional(),
        careerEndYear: careerYearSchema.nullable().optional(),

        education: uploadthingUrlSchema.nullable().optional(),
        resume: uploadthingUrlSchema.nullable().optional(),

        roleId: z.string().min(1),
        areaId: z.string().min(1).nullable().optional(),
        seniorityId: z.string().min(1).nullable().optional(),

        tagIds: applicantTagIdsSchema,
      })
      .superRefine((data, ctx) => {
        validateCareerYears(data, ctx);
      }),
  )
  .mutation(async ({ ctx, input }) => {
    const permission = await auth.api.hasPermission({
      headers: ctx.headers,
      body: {
        permissions: {
          applicant: ["update"],
        },
      },
    });

    if (!permission.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tenés permisos para editar candidatos",
      });
    }
    try {
      const applicant = await ctx.db.$transaction(async (tx) => {
        // Lock the applicant row so the change detection below and the update
        // are based on the same persisted state, even with concurrent edits.
        const lockedApplicants = await tx.$queryRaw<{ id: string }[]>`
          SELECT "id" FROM "applicant" WHERE "id" = ${input.id} AND "deleted_at" IS NULL FOR UPDATE
        `;

        if (lockedApplicants.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Candidato no encontrado",
          });
        }

        const [role, area, seniority, tagsCount] = await Promise.all([
          tx.jobRole.findUnique({
            where: { id: input.roleId },
            select: { id: true },
          }),
          input.areaId
            ? tx.area.findUnique({
                where: { id: input.areaId },
                select: { id: true },
              })
            : Promise.resolve(true),
          input.seniorityId
            ? tx.seniority.findUnique({
                where: { id: input.seniorityId },
                select: { id: true },
              })
            : Promise.resolve(true),
          tx.tag.count({ where: { id: { in: input.tagIds } } }),
        ]);

        if (
          !role ||
          !area ||
          !seniority ||
          tagsCount !== input.tagIds.length
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "El rol, área, seniority o tags seleccionados no existen",
          });
        }

        const current = await tx.applicant.findUniqueOrThrow({
          where: { id: input.id },
          select: {
            name: true,
            lastName: true,
            email: true,
            phone: true,
            photo: true,
            country: true,
            linkedin: true,
            englishLevel: true,
            source: true,
            hearAboutUs: true,
            title: true,
            academicInstitution: true,
            careerStartYear: true,
            careerEndYear: true,
            education: true,
            resume: true,
            roleId: true,
            areaId: true,
            seniorityId: true,
            tags: { select: { id: true } },
          },
        });

        // Values written by the update below; undefined leaves the field as is.
        const nextValues = {
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
          roleId: input.roleId,
          areaId: input.areaId === null ? null : input.areaId || undefined,
          seniorityId:
            input.seniorityId === null ? null : input.seniorityId || undefined,
        };

        // The edit form sends "" for these fields when they are stored as NULL,
        // so NULL and "" are treated as the same value when detecting changes.
        const emptyEqualsNullFields = new Set<keyof typeof nextValues>([
          "email",
          "phone",
          "country",
          "linkedin",
          "title",
          "academicInstitution",
        ]);

        const fieldsChanged = (
          Object.keys(nextValues) as Array<keyof typeof nextValues>
        ).some((key) => {
          const nextValue = nextValues[key];
          const currentValue = current[key];

          if (nextValue === undefined) return false;

          if (
            emptyEqualsNullFields.has(key) &&
            nextValue === "" &&
            currentValue === null
          ) {
            return false;
          }

          return nextValue !== currentValue;
        });

        const currentTagIds = new Set(current.tags.map((tag) => tag.id));
        const nextTagIds = new Set(input.tagIds);
        const tagsChanged =
          currentTagIds.size !== nextTagIds.size ||
          [...nextTagIds].some((id) => !currentTagIds.has(id));

        const applicant = await tx.applicant.update({
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

        if (fieldsChanged || tagsChanged) {
          await tx.activity.create({
            data: {
              applicantId: input.id,
              jobOpeningId: null,
              createdById: ctx.session.user.id,
              description: "actualizó los datos del candidato",
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
