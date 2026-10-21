import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { auth } from "~/lib/auth";

import { EnglishLevel, Source, HearAboutUs } from "~/generated/prisma/enums";

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

      englishLevel: z.enum(EnglishLevel).nullable().optional(),
      source: z.enum(Source).nullable().optional(),
      hearAboutUs: z.enum(HearAboutUs).nullable().optional(),

      title: z.string().optional(),
      academicInstitution: z.string().optional(),
      careerStartYear: z.number().nullable().optional(),
      careerEndYear: z.number().nullable().optional(),

      education: z.string().nullable().optional(),
      resume: z.string().nullable().optional(),

      roleId: z.string().min(1),
      areaId: z.string().nullable().optional(),
      seniorityId: z.string().nullable().optional(),

      tagIds: z.array(z.string()),
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
          SELECT "id" FROM "applicant" WHERE "id" = ${input.id} FOR UPDATE
        `;

        if (lockedApplicants.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Candidato no encontrado",
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
