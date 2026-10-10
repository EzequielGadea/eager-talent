"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Search, X } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import type { InterviewType } from "~/generated/prisma/enums";
import { api } from "~/lib/trpc/react";
import { cn } from "~/lib/utils";

import { Button } from "~/components/ui/button";
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

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];

const MODALITY_OPTIONS = [
  { value: "VideoCall", label: "Videollamada" },
  { value: "InPerson", label: "Presencial" },
] as const;

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const scheduleInterviewSchema = z
  .object({
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

// Fecha local de hoy (YYYY-MM-DD). toISOString() devuelve UTC,  restar desfase con Uruguay.
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
  stageName: string;
  onSuccess: () => void;
};

const fieldLabel = "text-sm font-medium text-text-secondary";
const fieldControl = "h-11 rounded-xl bg-white";

// Formato 24 h: deja solo dígitos y agrega los ":" automáticamente (1430 -> 14:30).
function formatTime24(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2
    ? `${digits.slice(0, 2)}:${digits.slice(2)}`
    : digits;
}

function initialsOf(name: string, lastName: string) {
  return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function ScheduleInterviewDialog({
  open,
  onOpenChange,
  applicantId,
  jobOpeningId,
  candidateName,
  stageName,
  onSuccess,
}: ScheduleInterviewDialogProps) {
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

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
      modality: "VideoCall",
      duration: 45,
      date: "",
      time: "",
      interviewerIds: [],
    },
  });

  function resetAll() {
    reset();
    setSearch("");
    setSearchFocused(false);
  }

  const createInterviewMutation = api.interview.create.useMutation({
    onSuccess: () => {
      resetAll();
      onOpenChange(false);
      onSuccess();
    },
  });

  function onSubmit(data: ScheduleInterviewFormValues) {
    createInterviewMutation.mutate({
      applicantId,
      jobOpeningId,
      name: stageName,
      modality: data.modality as InterviewType,
      duration: data.duration,
      date: new Date(`${data.date}T${data.time}`),
      interviewerIds: data.interviewerIds,
    });
  }

  const interviewers = interviewersQuery.data ?? [];

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          resetAll();
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="w-full max-w-xl gap-0 sm:max-w-xl overflow-visible rounded-2xl p-0">
        {/* Encabezado */}
        <div className="border-b border-border-default px-6 py-5">
          <DialogTitle className="text-xl font-semibold text-text-primary">
            Agregar entrevista
          </DialogTitle>

          <DialogDescription className="mt-1 text-sm text-text-secondary">
            Coordiná una entrevista para {candidateName}.
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <div className="flex flex-col gap-5 px-6 py-5">
            {/* Fecha y hora */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <label htmlFor="interview-date" className={fieldLabel}>
                  Fecha
                </label>
                <Input
                  id="interview-date"
                  type="date"
                  className={fieldControl}
                  min={getTodayLocalISO()}
                  {...register("date")}
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="interview-time" className={fieldLabel}>
                  Hora
                </label>
                <Controller
                  control={control}
                  name="time"
                  render={({ field }) => (
                    <Input
                      id="interview-time"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="14:30"
                      maxLength={5}
                      className={fieldControl}
                      value={field.value}
                      onBlur={field.onBlur}
                      onChange={(event) =>
                        field.onChange(formatTime24(event.target.value))
                      }
                    />
                  )}
                />
              </div>

              {(errors.date || errors.time) && (
                <p className="col-span-2 text-xs text-danger">
                  {errors.date?.message ?? errors.time?.message}
                </p>
              )}
            </div>

            {/* Duración y modalidad */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <label className={fieldLabel}>Duración</label>
                <Controller
                  control={control}
                  name="duration"
                  render={({ field }) => (
                    <Select
                      value={String(field.value)}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <SelectTrigger className={cn(fieldControl, "w-full")}>
                        <SelectValue>{`${field.value} min`}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {DURATION_OPTIONS.map((minutes) => (
                          <SelectItem key={minutes} value={String(minutes)}>
                            {minutes} min
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.duration && (
                  <p className="text-xs text-danger">
                    {errors.duration.message}
                  </p>
                )}
              </div>

              <div className="grid min-w-0 gap-2">
                <label className={fieldLabel}>Modalidad</label>
                <Controller
                  control={control}
                  name="modality"
                  render={({ field }) => (
                    <div
                      role="radiogroup"
                      aria-label="Modalidad"
                      className="flex h-11 w-full items-stretch gap-1 rounded-xl border border-border-default bg-slate-50 p-1"
                    >
                      {MODALITY_OPTIONS.map((option) => {
                        const selected = field.value === option.value;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => field.onChange(option.value)}
                            className={cn(
                              "min-w-0 flex-1 truncate rounded-lg px-2 text-sm whitespace-nowrap transition-colors",
                              selected
                                ? "bg-white font-semibold text-text-primary shadow-sm"
                                : "text-text-secondary hover:text-text-primary",
                            )}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                />
                {errors.modality && (
                  <p className="text-xs text-danger">
                    {errors.modality.message}
                  </p>
                )}
              </div>
            </div>

            {/* Entrevistadores */}
            <div className="grid gap-2">
              <label htmlFor="interviewer-search" className={fieldLabel}>
                Entrevistadores
              </label>

              <Controller
                control={control}
                name="interviewerIds"
                render={({ field }) => {
                  const selected = interviewers.filter((i) =>
                    field.value.includes(i.id),
                  );
                  const term = search.trim().toLowerCase();
                  const matches = interviewers.filter(
                    (i) =>
                      !field.value.includes(i.id) &&
                      `${i.name} ${i.lastName}`.toLowerCase().includes(term),
                  );
                  const showList = searchFocused;

                  return (
                    <div className="grid gap-2">
                      <div className="relative">
                        {showList && (
                          <div className="absolute right-0 bottom-full left-0 z-20 mb-2 max-h-56 overflow-y-auto rounded-xl border border-border-default bg-white p-2 shadow-lg">
                            <p className="px-2 pt-1 pb-2 text-xs font-medium text-text-secondary">
                              Usuarios del sistema
                            </p>

                            {interviewersQuery.isLoading ? (
                              <div className="flex justify-center py-3">
                                <Loader2 className="size-4 animate-spin text-text-secondary" />
                              </div>
                            ) : matches.length === 0 ? (
                              <p className="px-2 py-2 text-sm text-text-secondary">
                                {term
                                  ? "Sin resultados."
                                  : "No hay más usuarios disponibles."}
                              </p>
                            ) : (
                              matches.map((interviewer) => (
                                <button
                                  key={interviewer.id}
                                  type="button"
                                  onMouseDown={(event) => {
                                    event.preventDefault();
                                    field.onChange([
                                      ...field.value,
                                      interviewer.id,
                                    ]);
                                    setSearch("");
                                  }}
                                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-slate-50"
                                >
                                  <span className="flex size-7 items-center justify-center rounded-full bg-violet-100 text-[11px] font-semibold text-violet-700">
                                    {initialsOf(
                                      interviewer.name,
                                      interviewer.lastName,
                                    )}
                                  </span>
                                  <span className="text-sm text-text-primary">
                                    {interviewer.name} {interviewer.lastName}
                                  </span>
                                </button>
                              ))
                            )}
                          </div>
                        )}

                        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-text-secondary" />
                        <Input
                          id="interviewer-search"
                          autoComplete="off"
                          placeholder="Buscar entrevistador"
                          value={search}
                          onChange={(event) => setSearch(event.target.value)}
                          onFocus={() => setSearchFocused(true)}
                          onBlur={() => setSearchFocused(false)}
                          className={cn(fieldControl, "pl-10")}
                        />
                      </div>

                      {selected.length > 0 && (
                        <ul className="flex flex-wrap gap-2">
                          {selected.map((interviewer) => (
                            <li
                              key={interviewer.id}
                              className="flex items-center gap-2 rounded-full border border-border-default bg-slate-50 py-1 pr-1 pl-1"
                            >
                              <span className="flex size-6 items-center justify-center rounded-full bg-violet-100 text-[10px] font-semibold text-violet-700">
                                {initialsOf(
                                  interviewer.name,
                                  interviewer.lastName,
                                )}
                              </span>
                              <span className="text-sm text-text-primary">
                                {interviewer.name} {interviewer.lastName}
                              </span>
                              <button
                                type="button"
                                aria-label={`Quitar a ${interviewer.name} ${interviewer.lastName}`}
                                onClick={() =>
                                  field.onChange(
                                    field.value.filter(
                                      (id) => id !== interviewer.id,
                                    ),
                                  )
                                }
                                className="flex size-6 items-center justify-center rounded-full text-text-secondary hover:bg-slate-200 hover:text-text-primary"
                              >
                                <X className="size-3.5" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                }}
              />

              {errors.interviewerIds && (
                <p className="text-xs text-danger">
                  {errors.interviewerIds.message}
                </p>
              )}
            </div>

            {createInterviewMutation.isError && (
              <p className="text-sm text-danger">
                {createInterviewMutation.error.data?.code === "CONFLICT"
                  ? createInterviewMutation.error.message
                  : "No se pudo agendar la entrevista."}
              </p>
            )}
          </div>

          {/* Pie */}
          <div className="flex justify-end gap-2 rounded-b-2xl border-t border-border-default bg-slate-50 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="rounded-full px-5"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="rounded-full bg-slate-900 px-5 text-white hover:bg-slate-800"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              Crear entrevista
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
