import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";
import type { ImportedApplicant } from "~/lib/csv/parse-applicants-csv";

import { importedApplicantSchema } from "./import-applicants";

type ImportValidationError = {
  rowNumber: number;
  email: string;
  reason: string;
};

type ValidateImportApplicants = {
  validApplicants: ImportedApplicant[];
  errors: ImportValidationError[];
};

const validateImportApplicantsInputSchema = z.object({
  applicants: z.array(z.unknown()).min(1),
});

function getValidationIssueMessage(issue: z.core.$ZodIssue): string {
  const field = String(issue.path[0] ?? "");
  const fieldNames: Record<string, string> = {
    rowNumber: "El número de fila",
    email: "El email",
    name: "El nombre",
    lastName: "El apellido",
    role: "El rol",
    phone: "El teléfono",
    hearAboutUs: "Cómo conoció la empresa",
    tags: "Las habilidades",
    country: "La ubicación",
    englishLevel: "El nivel de inglés",
    source: "La fuente",
    title: "La carrera académica",
    seniority: "La seniority",
    linkedin: "El enlace de LinkedIn",
    externalId: "La identificación de PeopleForce",
  };
  const fieldName = fieldNames[field] ?? "El dato";

  if (field === "email") {
    if (issue.code === "too_small") {
      return "El email es obligatorio.";
    }

    return issue.code === "invalid_format"
      ? "El email no tiene un formato válido."
      : "El email es obligatorio y debe ser texto.";
  }

  if (["name", "lastName", "role"].includes(field)) {
    if (issue.code === "too_small") {
      return `${fieldName} es obligatorio.`;
    }

    return `${fieldName} debe ser texto.`;
  }

  if (field === "rowNumber") {
    return issue.code === "too_small"
      ? "El número de fila debe ser positivo."
      : "El número de fila debe ser un entero positivo.";
  }

  if (field === "tags") {
    return issue.path.length > 1
      ? "Cada habilidad debe ser texto y no puede estar vacía."
      : "Las habilidades deben venir en una lista.";
  }

  return `${fieldName} debe ser texto o estar vacío.`;
}

export const validateImportApplicants = protectedProcedure
  .input(validateImportApplicantsInputSchema)
  .mutation(async ({ input, ctx }): Promise<ValidateImportApplicants> => {
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
        message: "No tenés los permisos necesarios para importar candidatos.",
      });
    }

    // Validate csv rows against the importedApplicantSchema

    const validZodApplicants: ImportedApplicant[] = [];
    const errors: ImportValidationError[] = [];

    for (const [index, applicant] of input.applicants.entries()) {
      const rowNumber =
        typeof applicant === "object" &&
        applicant !== null &&
        "rowNumber" in applicant &&
        typeof applicant.rowNumber === "number" &&
        Number.isInteger(applicant.rowNumber) &&
        applicant.rowNumber > 0
          ? applicant.rowNumber
          : index + 2;
      const parsed = importedApplicantSchema.safeParse(applicant);

      if (!parsed.success) {
        errors.push({
          rowNumber,
          email:
            typeof applicant === "object" &&
            applicant !== null &&
            "email" in applicant &&
            typeof applicant.email === "string"
              ? applicant.email
              : "",
          reason: parsed.error.issues.map(getValidationIssueMessage).join(" "),
        });

        continue;
      }

      validZodApplicants.push(parsed.data);
    }
    const seenEmails = new Set<string>();
    const seenPeopleForceIds = new Set<string>();
    const validApplicants: ImportedApplicant[] = [];

    for (const applicant of validZodApplicants) {
      const normalizedEmail = applicant.email.trim().toLocaleLowerCase();

      if (seenEmails.has(normalizedEmail)) {
        errors.push({
          rowNumber: applicant.rowNumber,
          email: applicant.email,
          reason: "El email está repetido en el archivo.",
        });
        continue;
      }

      seenEmails.add(normalizedEmail);

      const peopleForceId = applicant.externalId?.trim() || null;

      if (peopleForceId && seenPeopleForceIds.has(peopleForceId)) {
        errors.push({
          rowNumber: applicant.rowNumber,
          email: applicant.email,
          reason: "El ID de PeopleForce está repetido en el archivo.",
        });
        continue;
      }

      if (peopleForceId) {
        seenPeopleForceIds.add(peopleForceId);
      }

      const existingApplicantEmail = await ctx.db.applicant.findFirst({
        where: {
          email: {
            equals: normalizedEmail,
            mode: "insensitive",
          },
          deletedAt: null,
        },
        select: { id: true },
      });

      if (existingApplicantEmail) {
        errors.push({
          rowNumber: applicant.rowNumber,
          email: applicant.email,
          reason: "Ya existe un candidato con ese email.",
        });
        continue;
      }

      if (peopleForceId) {
        const existingApplicantID = await ctx.db.applicant.findFirst({
          where: {
            peopleForceID: peopleForceId,
            deletedAt: null,
          },
          select: { id: true },
        });

        if (existingApplicantID) {
          errors.push({
            rowNumber: applicant.rowNumber,
            email: applicant.email,
            reason: "Ya existe un candidato con ese ID de PeopleForce.",
          });
          continue;
        }
      }

      validApplicants.push(applicant);
    }

    return {
      validApplicants,
      errors: errors.sort((a, b) => a.rowNumber - b.rowNumber),
    };
  });
