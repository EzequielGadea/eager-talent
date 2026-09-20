"use client";

import { api } from "~/lib/trpc/react";
import { useParams } from "next/navigation";

import { z } from "zod";

import { EnglishLevel, Source, HearAboutUs } from "~/generated/prisma/enums";
import ApplicantEditFormContent from "./edit-applicant-form-content";

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
  careerStartYear: z.number().optional(),
  careerEndYear: z.number().optional(),
});

export type ApplicantFormValues = z.infer<typeof applicantFormSchema>;

export default function EditApplicantForm() {
  const params = useParams<{ id: string }>();

  const id = params.id;

  const {
    data: applicant,
    isLoading,
    error,
  } = api.applicant.getApplicantById.useQuery({
    id: id,
  });

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (error || !applicant) {
    return <div>No se pudo cargar el candidato.</div>;
  }

  return <ApplicantEditFormContent applicant={applicant} />;
}
