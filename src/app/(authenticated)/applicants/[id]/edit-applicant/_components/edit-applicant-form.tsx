"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { api } from "~/lib/trpc/react";
import { useParams } from "next/navigation";

import { z } from "zod";

import { Button } from "~/components/ui/button";
import { EnglishLevel, Source, HearAboutUs } from "~/generated/prisma/enums";
import ApplicantEditFormContent from "./edit-applicant-form-content";
import { EditApplicantFormSkeleton } from "./edit-applicant-skeleton";

const MAX_PHOTO_SIZE = 4 * 1024 * 1024;

export const applicantFormSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  lastname: z.string().min(1, "El apellido es obligatorio"),
  email: z.string().min(1, "El correo es obligatorio").email("Correo inválido"),
  phone: z
    .string()
    .regex(
      /^\+[1-9]\d{1,14}$/,
      "El teléfono debe tener formato E.164 (ej. +59899000000)",
    )
    .optional()
    .or(z.literal("")),
  country: z.string(),
  photo: z
    .custom<FileList>()
    .refine(
      (files) =>
        !files ||
        files.length === 0 ||
        files[0].type === "image/png" ||
        files[0].type === "image/jpeg" ||
        files[0].type === "image/jpg",
      "El archivo debe ser una imagen PNG, JPEG o JPG",
    )
    .refine(
      (files) =>
        !files || files.length === 0 || files[0].size <= MAX_PHOTO_SIZE,
      "La foto no puede superar los 4 MB",
    )
    .optional(),

  linkedin: z
    .string()
    .url("Debe ingresar una URL válida")
    .refine(
      (url) => url.includes("linkedin.com"),
      "Debe ingresar una URL de LinkedIn válida",
    )
    .optional()
    .or(z.literal("")),

  role: z.string().min(1, "El rol es obligatorio"),

  seniority: z.string(),
  area: z.string(),

  englishLevel: z.union([z.enum(EnglishLevel), z.literal("")]),

  source: z.union([z.enum(Source), z.literal("")]),

  howDidYouHear: z.union([z.enum(HearAboutUs), z.literal("")]),

  tags: z.array(z.string()),

  resume: z
    .custom<FileList>()
    .refine(
      (files) =>
        !files || files.length === 0 || files[0].type === "application/pdf",
      "Debe subir un archivo PDF",
    )
    .optional(),

  education: z
    .custom<FileList>()
    .refine(
      (files) =>
        !files || files.length === 0 || files[0].type === "application/pdf",
      "Debe subir un archivo PDF",
    )
    .optional(),

  academicInstitution: z.string(),

  title: z.string(),
  careerStartYear: z.number().int().min(1900).max(2100).nullable().optional(),
  careerEndYear: z.number().int().min(1900).max(2100).nullable().optional(),
});

export type ApplicantFormValues = z.infer<typeof applicantFormSchema>;

export default function EditApplicantForm() {
  const params = useParams<{ id: string }>();

  const id = params.id;

  const {
    data: applicant,
    isLoading,
    error,
    refetch,
  } = api.applicant.getApplicantById.useQuery({
    id: id,
  });

  if (isLoading) {
    return <EditApplicantFormSkeleton />;
  }

  if (error || !applicant) {
    return (
      <main className="flex min-h-0 flex-1 items-center justify-center p-6">
        <div className="relative w-full max-w-105 rounded-3xl border bg-white p-8 shadow-lg">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-danger-bg">
              <AlertCircle className="size-6 text-danger" />
            </div>

            <div className="space-y-1">
              <h1 className="text-lg font-semibold text-text-primary">
                No se pudo cargar el candidato
              </h1>

              <p className="text-sm text-text-secondary">
                Ocurrió un error inesperado. Intentá nuevamente.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => void refetch()}
              className="mt-2 h-11 w-full rounded-full"
            >
              <RefreshCw className="size-4" />
              Intentar nuevamente
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return <ApplicantEditFormContent applicant={applicant} />;
}
