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

const UPLOAD_ERROR_MESSAGE =
  "No se pudo subir el archivo: verificá que sea un PDF o una imagen (PNG, JPG, WEBP o GIF) de hasta 4 MB.";

function getApplicantDefaultValues(applicant: Applicant): ApplicantFormValues {
  return {
    name: applicant.name,
    lastname: applicant.lastName,
    email: applicant.email ?? "",
    phone: applicant.phone?.replace(/\s/g, "") ?? "",
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
  const { startUpload } = useUploadThing("applicantFiles", {
    onUploadError: (error) => {
      // Field-level errors are set from the per-field result below; this is
      // only so the real reason shows up while debugging.
      console.error("Error uploading file:", error);
    },
  });

  const router = useRouter();

  const [photoPreview, setPhotoPreview] = useState<string | undefined>(
    applicant.photo ?? undefined,
  );
  const [removePhoto, setRemovePhoto] = useState(false);
  const [removeResume, setRemoveResume] = useState(false);
  const [removeEducation, setRemoveEducation] = useState(false);

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
    const resumeFile = data.resume?.[0];
    const educationFile = data.education?.[0];
    const photoFile = data.photo?.[0];

    const [resumeResult, educationResult, photoResult] = await Promise.all([
      resumeFile ? startUpload([resumeFile]) : undefined,
      educationFile ? startUpload([educationFile]) : undefined,
      photoFile ? startUpload([photoFile]) : undefined,
    ]);

    // startUpload() never throws: on failure it resolves to undefined. A file
    // was attempted but has no result means that specific upload failed, as
    // opposed to the field simply having no new file selected.
    const resumeFailed = Boolean(resumeFile) && !resumeResult;
    const educationFailed = Boolean(educationFile) && !educationResult;
    const photoFailed = Boolean(photoFile) && !photoResult;

    if (resumeFailed || educationFailed || photoFailed) {
      if (resumeFailed) {
        methods.setError("resume", {
          type: "server",
          message: UPLOAD_ERROR_MESSAGE,
        });
      }

      if (educationFailed) {
        methods.setError("education", {
          type: "server",
          message: UPLOAD_ERROR_MESSAGE,
        });
      }

      if (photoFailed) {
        methods.setError("photo", {
          type: "server",
          message: UPLOAD_ERROR_MESSAGE,
        });
      }

      // Stop here: don't save any field (not even the ones that have
      // nothing to do with files) until every attached file is resolved.
      return;
    }

    const newResumeUrl = resumeResult?.[0]?.ufsUrl;
    const newEducationUrl = educationResult?.[0]?.ufsUrl;
    const newPhotoUrl = photoResult?.[0]?.ufsUrl;

    // When there's no new upload and no explicit removal, send undefined
    // instead of the applicant's current URL. The mutation's schema
    // validates photo/resume/education against uploadthingUrlSchema (which
    // only accepts this app's own UploadThing bucket), and Prisma treats an
    // undefined field as "leave as is" (see the comment in updateApplicant's
    // nextValues). Re-sending the unchanged URL would re-run that
    // validation on every edit for no reason, and fails outright for
    // applicants whose photo/resume/education were never a real UploadThing
    // URL to begin with (e.g. seeded data) even when the user isn't
    // touching that field at all.
    const resumeUrl = newResumeUrl
      ? newResumeUrl
      : removeResume
        ? null
        : undefined;

    const educationUrl = newEducationUrl
      ? newEducationUrl
      : removeEducation
        ? null
        : undefined;

    const photoUrl = newPhotoUrl ? newPhotoUrl : removePhoto ? null : undefined;

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
