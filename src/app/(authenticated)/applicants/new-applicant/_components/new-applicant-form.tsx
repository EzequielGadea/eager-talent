"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { FormProvider, useForm } from "react-hook-form";

import { api } from "~/lib/trpc/react";

import { Button } from "~/components/ui/button";

import PersonalData from "./personal-data";
import ProfessionalProfile from "./professional-profile";

import EducationAndFiles from "./education-and-files";
import NewCandidateButton from "./new-applicant-button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import SourceAndTags from "./source-and-tags";
import { EnglishLevel, Source, HearAboutUs, SalaryCurrency } from "~/generated/prisma/enums";

import { useUploadThing } from "~/components/ui/uploadthing";

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
  photo: z.custom<FileList>()
          .refine((files) => !files || files.length === 0 || files[0].type === "image/png" || files[0].type === "image/jpeg" || files[0].type === "image/jpg", "El archivo debe ser una imagen PNG, JPEG o JPG")
          .optional(),

  linkedin: z.string().url("Debe ingresar una URL válida").
            refine((url) => url.includes("linkedin.com"), "Debe ingresar una URL de LinkedIn válida").
            optional().
            or(z.literal("")),

  role: z.string().min(1, "El rol es obligatorio"),
  jobOpening: z.string(),
  seniority: z.string(),
  area: z.string(),
  
  desiredSalary: z.number().positive().optional().or(z.literal("")),
  currency: z.union([z.enum(SalaryCurrency), z.literal("")]),

  availability: z.string(),
  englishLevel: z.union([z.enum(EnglishLevel), z.literal("")]),

  source: z.union([z.enum(Source), z.literal("")]),

  howDidYouHear: z.union([z.enum(HearAboutUs), z.literal("")]),

  tags: z.array(z.string()),

  resume: z.custom<FileList>()
          .refine((files) => !files || files.length === 0 || files[0].type === "application/pdf", "Debe subir un archivo PDF").optional(),

  education: z.custom<FileList>()
          .refine((files) => !files || files.length === 0 || files[0].type === "application/pdf", "Debe subir un archivo PDF")
          .optional(),

  academicInstitution: z.string(),


  title: z.string(),
  careerStartYear: z.number().optional(),
  careerEndYear: z.number().optional(),
}).superRefine((data, ctx) => {
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
  });;

export type ApplicantFormValues = z.infer<typeof applicantFormSchema>;

export default function NewApplicantForm() {
  const { startUpload } = useUploadThing("applicantFiles");
  const router = useRouter();
  const [photoPreview, setPhotoPreview] = useState<string>();

  const methods = useForm<ApplicantFormValues>({
    resolver: zodResolver(applicantFormSchema),

    defaultValues: {
      name: "",
      lastname: "",
      email: "",
      phone: "",
      country: "",
      linkedin: "",

      role: "",
      jobOpening: "",
      seniority: "",
      area: "",
      desiredSalary: undefined,
      currency: "",
      availability: "",
      englishLevel: "",

      source: "",
      howDidYouHear: "",
      tags: [],

      academicInstitution: "",
      title: "",
      careerStartYear: undefined,
      careerEndYear: undefined,
    },
  });

  const { isSubmitting } = methods.formState;

  const createCandidateMutation = api.applicant.createApplicant.useMutation({
    onSuccess: () => {
      methods.reset();
      setPhotoPreview(undefined);
      router.push("/applicants");
    },
    onError: (error) => {
      if (error.data?.code === "CONFLICT") {
        methods.setError("email", {
          type: "server",
          message: "Ya existe un candidato con ese email",
        });

        return;
      }

      console.error("Error creating candidate:", error);
    },
  });

  async function onSubmit(data: ApplicantFormValues) {
    const [resumeResult, educationResult, photoResult] = await Promise.all([
      data.resume?.[0] ? startUpload([data.resume[0]]) : undefined,
      data.education?.[0] ? startUpload([data.education[0]]) : undefined,
      data.photo?.[0] ? startUpload([data.photo[0]]) : undefined,
    ]);

    const resumeUrl = resumeResult?.[0]?.ufsUrl;
    const educationUrl = educationResult?.[0]?.ufsUrl;
    const photoUrl = photoResult?.[0]?.ufsUrl;

    console.log(data);

    await createCandidateMutation.mutateAsync({
      name: data.name,
      lastname: data.lastname,
      email: data.email,
      phone: data.phone,
      country: data.country,
      linkedin: data.linkedin,

      roleId: data.role,
      areaId: data.area || undefined,
      seniorityId: data.seniority || undefined,

      englishLevel: data.englishLevel || undefined,
      source: data.source || undefined,
      hearAboutUs: data.howDidYouHear || undefined,

      academicInstitution: data.academicInstitution,
      title: data.title,
      careerStartYear: data.careerStartYear,
      careerEndYear: data.careerEndYear,

      resume: resumeUrl,
      education: educationUrl,
      photo: photoUrl,
      tagIds: data.tags,

      jobOpeningId: data.jobOpening || undefined,
      desiredSalary:  data.desiredSalary ? String(data.desiredSalary) : undefined,
      currency: data.currency || undefined,
      availability: data.availability,
    });
  }

  function handleCancel() {
    methods.reset();
    setPhotoPreview(undefined);
    router.push("/applicants");
  }
  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4"
      >
        <PersonalData
          photoPreview={photoPreview}
          setPhotoPreview={setPhotoPreview}
        />
        <ProfessionalProfile />
        <SourceAndTags />
        <EducationAndFiles />

        <footer className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-text-secondary">
            Podés completar el resto de los campos más tarde desde el perfil.
          </p>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>

            <NewCandidateButton disabled={isSubmitting} />
          </div>
        </footer>
      </form>
    </FormProvider>
  );
}
