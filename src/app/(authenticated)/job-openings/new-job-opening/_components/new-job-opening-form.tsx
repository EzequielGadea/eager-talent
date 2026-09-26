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

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

import NewJobOpeningButtonProps from "./new-job-opening-button";

import OpeningHiring from "./opening-hiring";
import { Button } from "~/components/ui/button";

export const jobOpeningFormSchema = z.object({
  name: z.string().min(1, "El nombre de la vacante es obligatiorio"),
  area: z.string().min(1, "El area de la vacante es obligatoria"),
  status: z.enum(JobOpeningStatus),
  seniorityIds: z.array(z.string()).min(1, "Selecciona al menos un seniority"),
  location: z.string().min(1, "Selecciona una ubicación"),
  openingDate: z.date({ error: "La fecha de apertura es obligatoria" }),
  closingDate: z.date({ error: "La fecha de cierre es obligatoria" }),
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
      openingDate: undefined,
      closingDate: undefined,
      hiringManagerIds: [],
    },
  });
  const createJobOpeningMutation = api.jobOpening.createJobOpening.useMutation({
    onSuccess: (data) => {
      // router.push(`/job-openings/${data.id}`); DESCOMENTAR CUANDO ESTE IMPLEMENTADO LA CONSULTA DE VACANTE
      router.push("/job-openings");
    },
    onError: (error) => {
      console.error("Error creating job opening:", error.message, error.data);
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
        <Card className="w-full items-end rounded-x1 shadow-sm">
          <CardContent>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="h-8.5 gap-2 rounded-full bg-info-bg px-4 text-[13px] font-semibold shadow-none hover:bg-dashboard-dark-hover"
              >
                Cancelar
              </Button>
              <NewJobOpeningButtonProps />
            </div>
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  );
}
