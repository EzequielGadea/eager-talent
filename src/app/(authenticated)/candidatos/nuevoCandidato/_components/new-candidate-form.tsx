"use client";

import Link from "next/link";
import { useRouter } from "next/navigation"

import { buttonVariants } from "~/components/ui/button";
import {
  FormProvider,
  useForm,
} from "react-hook-form";

import { Button } from "~/components/ui/button";

import PersonalData from "./personal-data";
import ProfessionalProfile from "./professional-profile";
import SourceAndLabels from "./source-and-labels";
import EducationAndFiles from "./education-and-files";
import NewCandidateButton from "./new-candidate-button";

export type CandidateFormValues = {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  linkedin: string;

  role: string;
  jobOpening: string;
  seniority: string;
  area: string;
  desiredSalary: string;
  englishLevel: string;

  source: string;
  howDidYouHear: string;
  tags: string;

  education: string;
  cv?: FileList;
  academicRecord?: FileList;
};

export default function NewCandidateForm() {
  const router = useRouter();
  const methods = useForm<CandidateFormValues>({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      country: "",
      linkedin: "",

      role: "",
      jobOpening: "",
      seniority: "",
      area: "",
      desiredSalary: "",
      englishLevel: "",

      source: "",
      howDidYouHear: "",
      tags: "",

      education: "",
    },
  });

  function onSubmit(data: CandidateFormValues) {
    console.log(data);
  }

  function handleCancel() {
  methods.reset();
  router.push("/candidatos");
}

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4"
      >
        <PersonalData />
        <ProfessionalProfile />
        <SourceAndLabels />
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

            <NewCandidateButton />
          </div>
        </footer>
      </form>
    </FormProvider>
  );
}