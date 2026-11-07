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

import { Card, CardContent } from "~/components/ui/card";

import NewJobOpeningButtonProps from "./new-job-opening-button";

import OpeningHiring from "./opening-hiring";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { toast } from "~/components/ui/toast";
import { hasDuplicatedNames, Template } from "../utils";
import { isRequiredStage } from "~/lib/required-stage-types";
import { persistedStageSchema } from "~/lib/validations/job-opening";
import {
  getRequiredStageErrors,
  getRequiredStageTypeErrors,
} from "~/lib/validations/required-stages";
import { useState } from "react";

export const jobOpeningFormSchema = z
  .object({
    name: z.string().min(1, "El nombre de la vacante es obligatiorio"),
    area: z.string().min(1, "El área de la vacante es obligatoria"),
    status: z.enum(JobOpeningStatus),
    seniorityIds: z
      .array(z.string())
      .min(1, "Selecciona al menos un seniority"),
    location: z.string().min(1, "Selecciona una ubicación"),
    openingDate: z.date({ error: "La fecha de apertura es obligatoria" }),
    closingDate: z.date({ error: "La fecha de cierre es obligatoria" }),
    hiringManagerIds: z.array(z.string()),
    stages: z.array(persistedStageSchema).superRefine((stages, ctx) => {
      const errors = [
        ...getRequiredStageErrors(stages),
        ...getRequiredStageTypeErrors(stages),
      ];

      if (stages.some((stage) => stage.name.trim() === "")) {
        errors.push("No se permiten etapas sin nombre");
      }

      if (hasDuplicatedNames(stages)) {
        errors.push("No se permiten etapas con mismo nombre");
      }
      if (errors.length) {
        ctx.addIssue({
          code: "custom",
          path: [],
          message: errors.join(",\n"),
        });
      }
    }),
  })
  .refine((data) => data.closingDate >= data.openingDate, {
    path: ["closingDate"],
    message: "La fecha de cierre no puede ser anterior a la fecha de apertura",
  });

export type JobOpeningFormValues = z.infer<typeof jobOpeningFormSchema>;

export default function NewJobOpeningForm(props: { templateStages: Template }) {
  const router = useRouter();
  const methods = useForm<JobOpeningFormValues>({
    resolver: zodResolver(jobOpeningFormSchema),
    defaultValues: {
      name: "",
      area: "",
      status: JobOpeningStatus.Open,
      seniorityIds: [],
      location: "Indiferente",
      openingDate: undefined,
      closingDate: undefined,
      hiringManagerIds: [],
      stages: props.templateStages.stages,
    },
  });

  const { isSubmitting } = methods.formState;

  const createJobOpeningMutation = api.jobOpening.createJobOpening.useMutation({
    onSuccess: () => {
      methods.reset();
      setStages(props.templateStages.stages.map((stage) => ({ ...stage })));
      toast.add({
        title: "Vacante creada correctamente",
        type: "success",
      });
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
      stages: data.stages,
    });
  }
  function handleConfirmCancel() {
    methods.reset();
    setStages(props.templateStages.stages.map((stage) => ({ ...stage })));
    setIsCancelConfirmOpen(false);
    router.push("/job-openings");
  }

  const [stages, setStages] = useState(props.templateStages.stages);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  // Required stages as loaded from the template, by key, so typing one of
  // those names in a new stage does not lock it.
  const requiredStageKeys = new Set(
    props.templateStages.stages.flatMap((stage) =>
      isRequiredStage(stage) ? [stage.key] : [],
    ),
  );

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-4"
      >
        <OpeningData />
        <OpeningDate />
        <OpeningStage
          stages={stages}
          setStages={setStages}
          requiredStageKeys={requiredStageKeys}
        />
        <OpeningHiring />
        <Card className="w-full items-end rounded-xl shadow-sm">
          <CardContent>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting || createJobOpeningMutation.isPending}
                onClick={() => setIsCancelConfirmOpen(true)}
              >
                Cancelar
              </Button>
              <NewJobOpeningButtonProps disabled={isSubmitting} />
            </div>
          </CardContent>
        </Card>
      </form>

      <Dialog
        open={isCancelConfirmOpen}
        onOpenChange={(open) => {
          if (!open && !isSubmitting && !createJobOpeningMutation.isPending) {
            setIsCancelConfirmOpen(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Cancelar creación?</DialogTitle>
            <DialogDescription>
              ¿Seguro que querés cancelar? Se perderán los datos que hayas
              ingresado.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCancelConfirmOpen(false)}
            >
              Seguir editando
            </Button>
            <Button type="button" onClick={handleConfirmCancel}>
              Descartar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FormProvider>
  );
}
