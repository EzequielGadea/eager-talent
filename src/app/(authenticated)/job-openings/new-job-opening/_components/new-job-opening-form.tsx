"use client";

import { useRouter } from "next/navigation";

import { FormProvider, useForm } from "react-hook-form";

import { api } from "~/lib/trpc/react";

import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import { JobOpeningStatus } from "~/generated/prisma/enums";

import OpeningData from "./opening-data";

import OpeningDate from "./opening-date";

import OpeningStage from "./opening-stage";

import OpeningHiring from "./opening-hiring";

export const jobOpeningFormSchema = z.object({
  name: z.string().min(1, "El nombre de la vacante es obligatiorio"),
  area: z.string().min(1, "El area de la vacante es obligatoria"),
  status: z.enum(JobOpeningStatus),
  seniorityIds: z.array(z.string()),
  location: z.string(),
  openingDate: z.date(),
  closingDate: z.date(),
  hiringManagerIds: z.array(z.string()),
  // stages: z.json().optional(),
});

export type JobOpeningFormValues = z.infer<typeof jobOpeningFormSchema>;

export default function NewJobOpeningForm() {
  const router = useRouter();
  const methods = useForm<JobOpeningFormValues>({
    resolver: zodResolver(jobOpeningFormSchema),
    defaultValues: {
      name: "",
      area: "",
      status: JobOpeningStatus.Open,
      seniorityIds: [],
      location: "",
      openingDate: new Date(),
      closingDate: new Date(),
      hiringManagerIds: [],
    },
  });
  const createJobOpeningMutation = api.jobOpening.createJobOpening.useMutation({
    onSuccess: (data) => {
      router.push(`/job-openings/${data.id}`);
    },
    onError: () => {
      console.error("Error creating job opening");
    },
  });

  async function onSubmit(data: JobOpeningFormValues) {
    await createJobOpeningMutation.mutateAsync({
      name: data.name,
      area: data.area,
      status: data.status,
      seniorityIds: data.seniorityIds,
      location: data.location,
      openingDate: data.openingDate,
      closingDate: data.closingDate,
      hiringManagerIds: data.hiringManagerIds,
      //stages: data.stages,
    });
  }
  function handleCancel() {
    methods.reset();
    router.push("/job-openings");
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 p-4"
      >
        <OpeningData />
        <OpeningDate />
        <OpeningStage />
        <OpeningHiring />
      </form>
    </FormProvider>
  );
}
