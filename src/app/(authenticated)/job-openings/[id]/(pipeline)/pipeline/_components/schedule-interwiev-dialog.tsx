"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import type { InterviewType } from "~/generated/prisma/enums";
import { api } from "~/lib/trpc/react";

import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

const modalityLabels: Record<string, string> = {
  VideoCall: "Videollamada",
  InPerson: "Presencial",
};

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const scheduleInterviewSchema = z
  .object({
    name: z.string().trim().min(1, "El nombre es obligatorio."),
    modality: z.string().min(1, "Seleccioná una modalidad."),
    duration: z
      .number({ message: "Ingresá la duración en minutos." })
      .int()
      .positive("La duración debe ser mayor a 0."),
    date: z.string().min(1, "Seleccioná una fecha."),
    time: z.string().regex(TIME_REGEX, "Formato: HH:MM"),
    interviewerIds: z
      .array(z.string())
      .min(1, "Seleccioná al menos un entrevistador."),
  })
  .superRefine((data, ctx) => {
    if (!data.date || !TIME_REGEX.test(data.time)) return;

    const scheduledAt = new Date(`${data.date}T${data.time}`);

    if (
      Number.isNaN(scheduledAt.getTime()) ||
      scheduledAt.getTime() <= Date.now()
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["date"],
        message: "La fecha y hora deben ser posteriores al momento actual.",
      });
    }
  });

function getTodayLocalISO() {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

type ScheduleInterviewFormValues = z.infer<typeof scheduleInterviewSchema>;

type ScheduleInterviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicantId: string;
  jobOpeningId: string;
  candidateName: string;
  onSuccess: () => void;
};

export function ScheduleInterviewDialog({
  open,
  onOpenChange,
  applicantId,
  jobOpeningId,
  candidateName,
  onSuccess,
}: ScheduleInterviewDialogProps) {
  const interviewersQuery = api.user.listInterviewers.useQuery(undefined, {
    enabled: open,
  });

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ScheduleInterviewFormValues>({
    resolver: zodResolver(scheduleInterviewSchema),
    defaultValues: {
      name: "",
      modality: "",
      duration: 60,
      date: "",
      time: "",
      interviewerIds: [],
    },
  });

  const createInterviewMutation = api.interview.create.useMutation({
    onSuccess: () => {
      reset();
      onOpenChange(false);
      onSuccess();
    },
  });

  async function onSubmit(data: ScheduleInterviewFormValues) {
    await createInterviewMutation.mutateAsync({
      applicantId,
      jobOpeningId,
      name: data.name.trim(),
      modality: data.modality as InterviewType,
      duration: data.duration,
      date: new Date(`${data.date}T${data.time}`),
      interviewerIds: data.interviewerIds,
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          reset();
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="w-full max-w-lg gap-0 overflow-hidden p-0">
        <div className="border-b border-border-default px-6 py-5">
          <DialogTitle className="text-lg font-semibold text-text-primary">
            Agendar entrevista
          </DialogTitle>

          <DialogDescription className="mt-1 text-sm text-text-secondary">
            Coordiná una entrevista para {candidateName}.
          </DialogDescription>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5 px-6 py-5"
        >
          <div className="grid gap-2">
            <label
              htmlFor="interview-name"
              className="text-sm font-medium text-text-primary"
            >
              Nombre
            </label>
            <Input
              id="interview-name"
              placeholder="Ej. Entrevista técnica"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-danger">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-text-primary">
                Modalidad
              </label>
              <Controller
                control={control}
                name="modality"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => field.onChange(value ?? "")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Elegir">
                        {field.value ? modalityLabels[field.value] : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VideoCall">Videollamada</SelectItem>
                      <SelectItem value="InPerson">Presencial</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.modality && (
                <p className="text-xs text-danger">{errors.modality.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="interview-duration"
                className="text-sm font-medium text-text-primary"
              >
                Duración (min)
              </label>
              <Input
                id="interview-duration"
                type="number"
                min="1"
                {...register("duration", { valueAsNumber: true })}
              />
              {errors.duration && (
                <p className="text-xs text-danger">{errors.duration.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-text-primary">
              Fecha y hora
            </label>
            <div className="flex gap-2">
              <Input
                type="date"
                className="flex-1"
                min={getTodayLocalISO()}
                {...register("date")}
              />
              <Input
                type="text"
                placeholder="14:30"
                className="w-24"
                {...register("time")}
              />
            </div>
            {(errors.date || errors.time) && (
              <p className="text-xs text-danger">
                {errors.date?.message ?? errors.time?.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-text-primary">
              Entrevistadores
            </label>

            <Controller
              control={control}
              name="interviewerIds"
              render={({ field }) => (
                <div className="flex max-h-40 flex-col gap-2 overflow-y-auto rounded-lg border border-border-default p-3">
                  {interviewersQuery.isLoading ? (
                    <div className="flex justify-center py-2">
                      <Loader2 className="size-4 animate-spin text-text-secondary" />
                    </div>
                  ) : interviewersQuery.data?.length === 0 ? (
                    <p className="text-xs text-text-secondary">
                      No hay usuarios disponibles.
                    </p>
                  ) : (
                    interviewersQuery.data?.map((interviewer) => {
                      const checked = field.value.includes(interviewer.id);

                      return (
                        <label
                          key={interviewer.id}
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) => {
                              if (value) {
                                field.onChange([
                                  ...field.value,
                                  interviewer.id,
                                ]);
                              } else {
                                field.onChange(
                                  field.value.filter(
                                    (id) => id !== interviewer.id,
                                  ),
                                );
                              }
                            }}
                          />
                          <span className="text-sm text-text-primary">
                            {interviewer.name} {interviewer.lastName}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              )}
            />
            {errors.interviewerIds && (
              <p className="text-xs text-danger">
                {errors.interviewerIds.message}
              </p>
            )}
          </div>

          {createInterviewMutation.isError && (
            <p className="text-sm text-danger">
              No se pudo agendar la entrevista.
            </p>
          )}

          <div className="flex justify-end gap-2 border-t border-border-default pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Agendar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
