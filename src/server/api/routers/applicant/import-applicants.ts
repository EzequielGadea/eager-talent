
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { Prisma } from "~/generated/prisma/client";
import { auth } from "~/lib/auth";
import { getTagColor } from "~/lib/tags/get-tag-color";
import { protectedProcedure } from "~/server/api/trpc";

import {
  mapImportEnglishLevel,
  mapImportHearAboutUs,
  mapImportSource,
} from "~/lib/csv/applicant-import-enums";
import { normalizeImportPhone } from "~/lib/csv/normalize-import-phone";

const importedApplicantSchema = z.object({
  rowNumber: z.number().int().positive(),

  email: z.string().trim().toLowerCase().pipe(z.email()),
  name: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  role: z.string().trim().min(1),

  phone: z.string().nullable(),
  hearAboutUs: z.string().nullable(),
  tags: z.array(z.string().trim().min(1)),
  country: z.string().nullable(),
  englishLevel: z.string().nullable(),
  source: z.string().nullable(),
  title: z.string().nullable(),
  seniority: z.string().nullable(),
  linkedin: z.string().nullable(),
  externalId: z.string().nullable(),
});

const importApplicantsSchema = z.object({
  applicants: z.array(z.unknown()).min(1),
});

type ImportedApplicant = z.infer<typeof importedApplicantSchema>;

type ImportError = {
  rowNumber: number;
  email: string;
  reason: string;
};

function normalizeOptionalId(
  value: string | null,
): string | null {
  return value?.trim() || null;
}

function getRowNumber(
  value: unknown,
  fallback: number,
): number {
  if (
    typeof value === "object" &&
    value !== null &&
    "rowNumber" in value &&
    typeof value.rowNumber === "number" &&
    Number.isInteger(value.rowNumber) &&
    value.rowNumber > 0
  ) {
    return value.rowNumber;
  }

  return fallback;
}

function getEmail(value: unknown): string {
  if (
    typeof value === "object" &&
    value !== null &&
    "email" in value &&
    typeof value.email === "string"
  ) {
    return value.email;
  }

  return "";
}

function getImportErrorMessage(error: unknown): string {
  if (error instanceof TRPCError) {
    return error.message;
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError
  ) {
    if (error.code === "P2002") {
      const target = error.meta?.target;
      const fields = Array.isArray(target)
        ? target.map(String).join(" ").toLowerCase()
        : typeof target === "string"
          ? target.toLowerCase()
          : "";

      if (fields.includes("peopleforce")) {
        return "Ya existe un candidato con ese ID de PeopleForce.";
      }

      if (fields.includes("email")) {
        return "Ya existe un candidato con ese email.";
      }

      return "Ya existe un registro con esos datos únicos.";
    }
  }

  return "Ocurrió un error al guardar el candidato.";
}

export const importApplicants = protectedProcedure
  .input(importApplicantsSchema)
  .mutation(async ({ ctx, input }) => {
    // 1. Check all permissions before any database writes.
   

    const applicantCreate = await auth.api.hasPermission({
  headers: ctx.headers,
  body: { permissions: { applicant: ["create"] } },
});

const applicantUpdate = await auth.api.hasPermission({
  headers: ctx.headers,
  body: { permissions: { applicant: ["update"] } },
});

const roleCreate = await auth.api.hasPermission({
  headers: ctx.headers,
  body: { permissions: { jobRole: ["create"] } },
});

const seniorityCreate = await auth.api.hasPermission({
  headers: ctx.headers,
  body: { permissions: { seniority: ["create"] } },
});

if (
  !applicantCreate.success ||
  !applicantUpdate.success ||
  !roleCreate.success ||
  !seniorityCreate.success
) {
  throw new TRPCError({
    code: "FORBIDDEN",
    message:
      "No tenés los permisos necesarios para importar candidatos.",
  });
}

    // 2. Prepare import results.
    let imported = 0;
    const errors: ImportError[] = [];

    const seenEmails = new Set<string>();
    const seenPeopleForceIds = new Set<string>();

    // 3. Process each candidate independently.
    for (const [index, rawApplicant] of input.applicants.entries()) {
      const fallbackRow = index + 2;

      const parsed = importedApplicantSchema.safeParse(rawApplicant);

      if (!parsed.success) {
        errors.push({
          rowNumber: getRowNumber(rawApplicant, fallbackRow),
          email: getEmail(rawApplicant),
          reason: parsed.error.issues
            .map((issue) => issue.message)
            .join("; "),
        });

        continue;
      }

      const applicant: ImportedApplicant = parsed.data;

      const normalizedEmail = applicant.email.toLowerCase();

      const peopleForceId = normalizeOptionalId(
        applicant.externalId,
      );

      // 4. Check duplicates inside the import batch.
      if (seenEmails.has(normalizedEmail)) {
        errors.push({
          rowNumber: applicant.rowNumber,
          email: applicant.email,
          reason: "El email está repetido en la importación.",
        });

        continue;
      }

      seenEmails.add(normalizedEmail);

      if (
        peopleForceId &&
        seenPeopleForceIds.has(peopleForceId)
      ) {
        errors.push({
          rowNumber: applicant.rowNumber,
          email: applicant.email,
          reason:
            "El ID de PeopleForce está repetido en la importación.",
        });

        continue;
      }

      if (peopleForceId) {
        seenPeopleForceIds.add(peopleForceId);
      }

      try {
        // 5. One transaction per candidate.
        await ctx.db.$transaction(async (tx) => {
          // Check existing email.
          const existingEmail = await tx.applicant.findFirst({
            where: {
              email: {
                equals: applicant.email,
                mode: "insensitive",
              },
            },
            select: { id: true },
          });

          if (existingEmail) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Ya existe un candidato con ese email.",
            });
          }

          // Check existing PeopleForce ID.
          if (peopleForceId) {
            const existingPeopleForceId =
              await tx.applicant.findUnique({
                where: {
                  peopleForceID: peopleForceId,
                },
                select: { id: true },
              });

            if (existingPeopleForceId) {
              throw new TRPCError({
                code: "CONFLICT",
                message:
                  "Ya existe un candidato con ese ID de PeopleForce.",
              });
            }
          }

          // 6. Find or create job role.
          let role = await tx.jobRole.findFirst({
            where: {
              name: {
                equals: applicant.role,
                mode: "insensitive",
              },
            },
            select: { id: true },
          });

          if (!role) {
            role = await tx.jobRole.create({
              data: {
                name: applicant.role,
              },
              select: { id: true },
            });
          }

          // 7. Find or create seniority.
          let seniorityId: string | undefined;

          if (applicant.seniority?.trim()) {
            const seniorityName = applicant.seniority.trim();

            let seniority = await tx.seniority.findFirst({
              where: {
                name: {
                  equals: seniorityName,
                  mode: "insensitive",
                },
              },
              select: { id: true },
            });

            if (!seniority) {
              const lastSeniority = await tx.seniority.findFirst({
                orderBy: { order: "desc" },
                select: { order: true },
              });

              seniority = await tx.seniority.create({
                data: {
                  name: seniorityName,
                  order: (lastSeniority?.order ?? 0) + 1,
                  color: "#94A3B8",
                },
                select: { id: true },
              });
            }

            seniorityId = seniority.id;
          }

          // 8. Find or create tags.
          const tagIds: string[] = [];

          for (const rawTagName of applicant.tags) {
            const tagName = rawTagName.trim();

            // Avoid processing the same tag twice.
            if (!tagName) continue;

            let tag = await tx.tag.findFirst({
              where: {
                name: {
                  equals: tagName,
                  mode: "insensitive",
                },
              },
              select: { id: true },
            });

            if (!tag) {
              tag = await tx.tag.create({
                data: {
                  name: tagName,
                  isSkill: true,
                  color: getTagColor(tagName),
                },
                select: { id: true },
              });
            }

            if (!tagIds.includes(tag.id)) {
              tagIds.push(tag.id);
            }
          }

          // 9. Create applicant.
          const createdApplicant = await tx.applicant.create({
            data: {
              name: applicant.name,
              lastName: applicant.lastName,
              email: applicant.email,
              peopleForceID: peopleForceId,

              phone: normalizeImportPhone(applicant.phone),
              country: applicant.country,
              linkedin: normalizeImportLinkedin(applicant.linkedin),
              title: applicant.title,

              source: mapImportSource(applicant.source),
              englishLevel: mapImportEnglishLevel(
                applicant.englishLevel,
              ),
              hearAboutUs: mapImportHearAboutUs(
                applicant.hearAboutUs,
              ),

              role: {
                connect: { id: role.id },
              },

              seniority: seniorityId
                ? {
                    connect: { id: seniorityId },
                  }
                : undefined,

              tags: {
                connect: tagIds.map((id) => ({ id })),
              },
            },
          });

          // 10. Register creation activity.
          await tx.activity.create({
            data: {
              applicantId: createdApplicant.id,
              jobOpeningId: null,
              createdById: ctx.session.user.id,
              description: "creó el candidato",
            },
          });
        });

        imported++;
      } catch (error) {
  console.error(
    `Error importando candidato en la fila ${applicant.rowNumber}:`,
    error,
  );

  errors.push({
    rowNumber: applicant.rowNumber,
    email: applicant.email,
    reason: getImportErrorMessage(error),
  });
}
    }

    // 11. Return final import summary.
    return {
      total: input.applicants.length,
      imported,
      failed: errors.length,
      errors,
    };
  });


  function normalizeImportLinkedin(
  linkedin: string | null,
): string | null {
  if (!linkedin?.trim()) return null;

  try {
    const url = new URL(linkedin.trim());

    const validProtocol =
      url.protocol === "https:" || url.protocol === "http:";

    const validHostname =
      url.hostname === "linkedin.com" ||
      url.hostname === "www.linkedin.com";

    return validProtocol && validHostname
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}