"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useUploadThing } from "~/components/ui/uploadthing";
import { Button } from "~/components/ui/button";
import { api } from "~/lib/trpc/react";

import {
  applicantFormSchema,
  type ApplicantFormValues,
} from "./edit-applicant-form";

import PersonalData from "./personal-data";
import ProfessionalProfile from "./professional-profile";
import SourceAndTags from "./source-and-tags";
import EducationAndFiles from "./education-and-files";

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";
import EditApplicantButton from "./edit-applicant-button";

type RouterOutputs = inferRouterOutputs<AppRouter>;

type Applicant = RouterOutputs["applicant"]["getApplicantById"];

type Props = {
  applicant: Applicant;
};

function getApplicantDefaultValues(applicant: Applicant): ApplicantFormValues {
  return {
    name: applicant.name,
    lastname: applicant.lastName,
    email: applicant.email ?? "",
    phone: applicant.phone ?? "",
    country: applicant.country ?? "",
    linkedin: applicant.linkedin ?? "",

    role: applicant.role.id,
    area: applicant.area?.id ?? "",
    seniority: applicant.seniority?.id ?? "",

    englishLevel: applicant.englishLevel ?? "",
    source: applicant.source ?? "",
    howDidYouHear: applicant.hearAboutUs ?? "",

    tags: applicant.tags.map((tag) => tag.id),

    academicInstitution: applicant.academicInstitution ?? "",
    title: applicant.title ?? "",
    careerStartYear: applicant.careerStartYear ?? undefined,
    careerEndYear: applicant.careerEndYear ?? undefined,

    photo: undefined,
    resume: undefined,
    education: undefined,
  };
}

export default function EditApplicantFormContent({ applicant }: Props) {
  const { startUpload } = useUploadThing("applicantFiles");

  const router = useRouter();

  const [photoPreview, setPhotoPreview] = useState<string | undefined>(
    applicant.photo ?? undefined,
  );
  const [removePhoto, setRemovePhoto] = useState(false);

  const methods = useForm<ApplicantFormValues>({
    resolver: zodResolver(applicantFormSchema),

    defaultValues: getApplicantDefaultValues(applicant),
  });

  const { isSubmitting } = methods.formState;

  const updateApplicantMutation = api.applicant.updateApplicant.useMutation({
    onSuccess: () => {
      router.push(`/applicants/${applicant.id}`);
      router.refresh();
    },
    onError: (error) => {
      if (error.data?.code === "CONFLICT") {
        methods.setError("email", {
          type: "server",
          message: "Ya existe un candidato con ese email",
        });

        return;
      }

      console.error("Error updating applicant:", error);
    },
  });

  async function onSubmit(data: ApplicantFormValues) {
    const [resumeResult, educationResult, photoResult] = await Promise.all([
      data.resume?.[0] ? startUpload([data.resume[0]]) : undefined,
      data.education?.[0] ? startUpload([data.education[0]]) : undefined,
      data.photo?.[0] ? startUpload([data.photo[0]]) : undefined,
    ]);

    const newResumeUrl = resumeResult?.[0]?.ufsUrl;
    const newEducationUrl = educationResult?.[0]?.ufsUrl;
    const newPhotoUrl = photoResult?.[0]?.ufsUrl;

    const resumeUrl = newResumeUrl
      ? newResumeUrl
      : removeResume
        ? null
        : applicant.resume;

    const educationUrl = newEducationUrl
      ? newEducationUrl
      : removeEducation
        ? null
        : applicant.education;

    const photoUrl = newPhotoUrl
      ? newPhotoUrl
      : removePhoto
        ? null
        : applicant.photo;

    await updateApplicantMutation.mutateAsync({
      id: applicant.id,

      name: data.name,
      lastname: data.lastname,
      email: data.email,
      phone: data.phone,
      country: data.country,
      linkedin: data.linkedin,

      roleId: data.role,
      areaId: data.area || null,
      seniorityId: data.seniority || null,

      englishLevel: data.englishLevel === "" ? null : data.englishLevel,
      source: data.source === "" ? null : data.source,
      hearAboutUs: data.howDidYouHear === "" ? null : data.howDidYouHear,

      academicInstitution: data.academicInstitution,
      title: data.title,
      careerStartYear: data.careerStartYear,
      careerEndYear: data.careerEndYear,

      resume: resumeUrl,
      education: educationUrl,
      photo: photoUrl,

      tagIds: data.tags,
    });
  }

  function handleCancel() {
    methods.reset(getApplicantDefaultValues(applicant));

    setPhotoPreview(applicant.photo ?? undefined);
    setRemovePhoto(false);
    setRemoveResume(false);
    setRemoveEducation(false);

    router.push(`/applicants/${applicant.id}`);
  }
  const [removeResume, setRemoveResume] = useState(false);
  const [removeEducation, setRemoveEducation] = useState(false);
  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 p-4"
      >
        <PersonalData
          currentPhoto={applicant.photo}
          photoPreview={photoPreview}
          setPhotoPreview={setPhotoPreview}
          removePhoto={removePhoto}
          setRemovePhoto={setRemovePhoto}
        />

        <ProfessionalProfile />

        <SourceAndTags />

        <EducationAndFiles
          currentResume={applicant.resume}
          currentEducation={applicant.education}
          removeResume={removeResume}
          setRemoveResume={setRemoveResume}
          removeEducation={removeEducation}
          setRemoveEducation={setRemoveEducation}
        />

        <footer className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-text-secondary">
            Modificá los datos del candidato y guardá los cambios.
          </p>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>

            <EditApplicantButton disabled={isSubmitting} />
          </div>
        </footer>
      </form>
    </FormProvider>
  );
}
