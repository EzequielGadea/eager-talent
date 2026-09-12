"use client";

import Link from "next/link";
import { useRouter } from "next/navigation"

import { buttonVariants } from "~/components/ui/button";
import {
  FormProvider,
  useForm,
} from "react-hook-form";

import { api } from "~/lib/trpc/react";

import { Button } from "~/components/ui/button";

import PersonalData from "./personal-data";
import ProfessionalProfile from "./professional-profile";

import EducationAndFiles from "./education-and-files";
import NewCandidateButton from "./new-candidate-button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import SourceAndTags from "./source-and-tags";
import { EnglishLevel, Source, HearAboutUs } from "~/generated/prisma/browser";

import { useUploadThing } from "~/components/ui/uploadthing";


export const candidateFormSchema = z.object({
  name : z.string().min(1, "El nombre es obligatorio"),
  lastname: z.string().min(1, "El apellido es obligatorio"),
  email: z.string().min(1, "El correo es obligatorio").email("Correo inválido"),
  phone: z.string(),
  country: z.string(),
  photo : z.custom<FileList>().optional(),
  linkedin: z.string(),

  role: z.string().min(1, "El rol es obligatorio"),
  jobOpening: z.string(),
  seniority: z.string(),
  area: z.string(),
  desiredSalary: z.string(),
  availability: z.string(),
  englishLevel: z.union([
    z.enum(EnglishLevel),
    z.literal(""),
  ]),

  source: z.union([
    z.enum(Source),
    z.literal(""),
  ]),
  
  howDidYouHear: z.union([
    z.enum(HearAboutUs),
    z.literal(""),
  ]),

  tags: z.array(z.string()),
  resume: z.custom<FileList>().optional(),
  academicInstitution: z.string(),
  education: z.custom<FileList>().optional(),
});


export type CandidateFormValues =
  z.infer<typeof candidateFormSchema>;




export default function NewCandidateForm() {
  
  const { startUpload } = useUploadThing("candidateFiles");
  const router = useRouter();
  const methods = useForm<CandidateFormValues>({
  resolver: zodResolver(candidateFormSchema),
  


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
    desiredSalary: "",
    availability: "",
    englishLevel: "",

    source: "",
    howDidYouHear: "",
    tags:  [],

    academicInstitution: "",
  },
});

  const createCandidateMutation = api.applicant.createApplicant.useMutation({
    onSuccess: () => {
      methods.reset();
      router.push("/candidates");
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
    }
  });

  async function onSubmit(data: CandidateFormValues) {

    let resumeUrl, educationUrl, photoUrl: string | undefined;

    const resume = data.resume?.[0];

    if (resume) {
      const uploadedFiles = await startUpload([resume]);
      resumeUrl = uploadedFiles?.[0]?.url;
    }

    const education = data.education?.[0];

    if (education) {
      const uploadedFiles = await startUpload([education]);
      educationUrl = uploadedFiles?.[0]?.url;
    }

    const photo = data.photo?.[0];

    if (photo) {
      const uploadedFiles = await startUpload([photo]);
      photoUrl = uploadedFiles?.[0]?.url;
    }





    console.log(data);
    createCandidateMutation.mutate({
    name : data.name,
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
    resume: resumeUrl,
    education: educationUrl,
    photo: photoUrl,
    tagIds: data.tags,
    
    jobOpeningId: data.jobOpening || undefined,
    desiredSalary: data.desiredSalary || undefined,
    availability: data.availability,

  });
  }

  function handleCancel() {
  methods.reset();
  router.push("/candidates");
}

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4"
      >
        <PersonalData />
        <ProfessionalProfile />
        <SourceAndTags />
        <EducationAndFiles />

        <footer className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Podés completar el resto de los campos más tarde desde el perfil.
          </p>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              Cancelar
            </Button>

            <NewCandidateButton/>
          </div>
        </footer>
      </form>
    </FormProvider>
  );
}