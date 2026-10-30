"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { TZDate } from "@date-fns/tz";
import { parseDateTime, toZoned } from "@internationalized/date";
import { format } from "date-fns";
import { Loader2, Pencil, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~/components/ui/dialog";
import { DatePicker } from "~/components/ui/date-picker";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { toast } from "~/components/ui/toast";
import { InterviewType } from "~/generated/prisma/enums";
import { interviewTypeTranslations } from "~/lib/enum-translations";
import { api } from "~/lib/trpc/react";
import { cn } from "~/lib/utils";
import getAvatar from "~/lib/avatar";

const INTERVIEW_TIME_ZONE = "America/Montevideo";

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];

const MODALITY_OPTIONS = Object.values(InterviewType).map((value) => ({
  value,
  label: interviewTypeTranslations[value],
}));

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

type Interviewer = {
  id: string;
  name: string;
  lastName: string;
  role?: string;
};

export type EditableInterview = {
  id: string;
  exploratoryName: string | null;
  stageId: string | null;
  jobOpeningId: string | null;
  date: Date | null;
  duration: number;
  modality: InterviewType;
  interviewers: Interviewer[];
};

const createEditInterviewSchema = (isExploratory: boolean) =>
  z
    .object({
      exploratoryName: z
        .string()
        .trim()
        .max(120, "El nombre de la entrevista no puede superar 120 caracteres")
        .optional(),
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
      if (isExploratory && !data.exploratoryName?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["exploratoryName"],
          message: "El nombre es obligatorio.",
        });
      }
    });

type EditInterviewFormValues = z.infer<
  ReturnType<typeof createEditInterviewSchema>
>;

const fieldLabel = "text-sm font-medium text-text-secondary";
const fieldControl =
  "h-11 rounded-xl bg-surface-card focus-visible:border-border-focus focus-visible:ring-4 focus-visible:ring-border-focus/20";

const datePickerControl =
  "[--date-picker-height:2.75rem] [--date-picker-radius:var(--radius-xl)]";

function getInitialValues(
  interview: EditableInterview,
): EditInterviewFormValues {
  const mvdDate = interview.date
    ? new TZDate(interview.date, INTERVIEW_TIME_ZONE)
    : null;

  return {
    exploratoryName: interview.exploratoryName ?? "",
    modality: interview.modality,
    duration: interview.duration,
    date: mvdDate ? format(mvdDate, "yyyy-MM-dd") : "",
    time: mvdDate ? format(mvdDate, "HH:mm") : "",
    interviewerIds: interview.interviewers.map(({ id }) => id),
  };
}

// 24 h format: keeps only digits and inserts the ":" (1430 -> 14:30).
function formatTime24(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2
    ? `${digits.slice(0, 2)}:${digits.slice(2)}`
    : digits;
}

function initialsOf(name: string, lastName: string) {
  return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function roleLabel(role?: string) {
  if (!role) return "";

  return role === "hiringManager"
    ? "Hiring Manager"
    : role.charAt(0).toUpperCase() + role.slice(1);
}

type EditInterviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interview: EditableInterview;
  candidateName: string;
};

export function EditInterviewDialog({
  open,
  onOpenChange,
  interview,
  candidateName,
}: EditInterviewDialogProps) {
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const interviewersQuery = api.user.listInterviewers.useQuery(undefined, {
    enabled: open,
  });

  const initialValues = getInitialValues(interview);
  const durationOptions = DURATION_OPTIONS.includes(initialValues.duration)
    ? DURATION_OPTIONS
    : [...DURATION_OPTIONS, initialValues.duration].sort((a, b) => a - b);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditInterviewFormValues>({
    resolver: zodResolver(createEditInterviewSchema(!interview.jobOpeningId)),
    defaultValues: initialValues,
  });

  function resetAll() {
    reset(initialValues);
    setSearch("");
    setSearchFocused(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) resetAll();
    onOpenChange(nextOpen);
  }

  const updateInterview = api.interview.update.useMutation({
    onError: (error) => {
      toast.add({ title: error.message, type: "error" });
    },
    onSuccess: () => {
      toast.add({
        title: "Entrevista actualizada correctamente",
        type: "success",
      });

      // Keeps the dialog open until the refreshed details have streamed in.
      startTransition(() => {
        onOpenChange(false);
        router.refresh();
      });
    },
  });

  const isPending = updateInterview.isPending || isRefreshing;

  function onSubmit(data: EditInterviewFormValues) {
    const date = toZoned(
      parseDateTime(`${data.date}T${data.time}`),
      INTERVIEW_TIME_ZONE,
    ).toDate();

    updateInterview.mutate({
      id: interview.id,
      exploratoryName: interview.jobOpeningId
        ? undefined
        : data.exploratoryName?.trim(),
      modality: data.modality as InterviewType,
      duration: data.duration,
      date,
      interviewerIds: data.interviewerIds,
    });
  }

  const interviewers = interviewersQuery.data ?? [];
  // Current interviewers may be missing from the selectable list (e.g. inactive).
  const knownUsers = new Map(
    [...interview.interviewers, ...interviewers].map(
      (user): [string, Interviewer] => [user.id, user],
    ),
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-w-xl gap-0 overflow-visible rounded-2xl p-0 sm:max-w-xl">
        <div className="border-b border-border-default px-6 py-5">
          <DialogTitle className="text-xl font-semibold text-text-primary">
            Editar entrevista
          </DialogTitle>

          <DialogDescription className="mt-1 text-sm text-text-secondary">
            Modificá los datos de la entrevista de {candidateName}.
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <div className="flex flex-col gap-5 px-6 py-5">
            {!interview.jobOpeningId && (
              <div className="grid gap-2">
                <label htmlFor="edit-interview-name" className={fieldLabel}>
                  Nombre
                </label>
                <Input
                  id="edit-interview-name"
                  placeholder="Ej. Entrevista técnica"
                  maxLength={120}
                  className={fieldControl}
                  {...register("exploratoryName")}
                />
                {errors.exploratoryName && (
                  <p className="text-xs text-danger">
                    {errors.exploratoryName.message}
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="grid content-start gap-2">
                <label htmlFor="edit-interview-date" className={fieldLabel}>
                  Fecha
                </label>
                <Controller
                  control={control}
                  name="date"
                  render={({ field }) => (
                    <DatePicker
                      id="edit-interview-date"
                      name={field.name}
                      aria-label="Fecha"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      isInvalid={!!errors.date}
                      className={datePickerControl}
                    />
                  )}
                />
                {errors.date && (
                  <p className="text-xs text-danger">{errors.date.message}</p>
                )}
              </div>

              <div className="grid content-start gap-2">
                <label htmlFor="edit-interview-time" className={fieldLabel}>
                  Hora
                </label>
                <Controller
                  control={control}
                  name="time"
                  render={({ field }) => (
                    <Input
                      id="edit-interview-time"
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
                {errors.time && (
                  <p className="text-xs text-danger">{errors.time.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <label htmlFor="edit-interview-duration" className={fieldLabel}>
                  Duración
                </label>
                <Controller
                  control={control}
                  name="duration"
                  render={({ field }) => (
                    <Select
                      value={String(field.value)}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <SelectTrigger
                        id="edit-interview-duration"
                        className={cn(fieldControl, "w-full")}
                      >
                        <SelectValue>{`${field.value} min`}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {durationOptions.map((minutes) => (
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
                <span className={fieldLabel}>Modalidad</span>
                <Controller
                  control={control}
                  name="modality"
                  render={({ field }) => (
                    <div
                      role="radiogroup"
                      aria-label="Modalidad"
                      className="flex h-11 w-full items-stretch gap-1 rounded-xl border border-border-default bg-surface-sunken p-1"
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
                                ? "bg-surface-card font-semibold text-text-primary shadow-sm"
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

            <div className="grid gap-2">
              <label htmlFor="edit-interviewer-search" className={fieldLabel}>
                Entrevistadores
              </label>

              <Controller
                control={control}
                name="interviewerIds"
                render={({ field }) => {
                  const selected = field.value.flatMap((id) => {
                    const user = knownUsers.get(id);
                    return user ? [user] : [];
                  });
                  const term = search.trim().toLowerCase();
                  const matches = interviewers.filter(
                    (i) =>
                      !field.value.includes(i.id) &&
                      `${i.name} ${i.lastName}`.toLowerCase().includes(term),
                  );

                  return (
                    <div className="grid gap-2">
                      <div className="relative">
                        {searchFocused && (
                          <div
                            className="absolute right-0 bottom-full left-0 z-20 mb-2 max-h-56 overflow-y-auto rounded-xl border border-border-default bg-surface-card p-2 shadow-lg"
                            onMouseDown={(event) => event.preventDefault()}
                          >
                            <p className="px-2 pt-1 pb-2 font-sans text-xs font-bold tracking-[0.06em] text-text-secondary uppercase">
                              USUARIOS DEL SISTEMA
                            </p>

                            {interviewersQuery.isLoading ? (
                              <div
                                className="flex justify-center py-3"
                                role="status"
                                aria-label="Cargando entrevistadores…"
                              >
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
                                  // onMouseDown keeps the input focused until the click registers.
                                  onMouseDown={(event) => {
                                    event.preventDefault();
                                    field.onChange([
                                      ...field.value,
                                      interviewer.id,
                                    ]);
                                    setSearch("");
                                  }}
                                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-surface-hover focus-visible:bg-surface-hover"
                                >
                                  <span
                                    className={cn(
                                      "flex size-7 items-center justify-center rounded-full text-[11px] font-semibold",
                                      getAvatar(
                                        interviewer.name,
                                        interviewer.lastName,
                                      ).colorClass,
                                    )}
                                  >
                                    {initialsOf(
                                      interviewer.name,
                                      interviewer.lastName,
                                    )}
                                  </span>
                                  <span className="flex min-w-0 flex-1 items-center gap-2">
                                    <span className="truncate text-sm text-text-primary">
                                      {interviewer.name} {interviewer.lastName}
                                    </span>
                                    <span className="ml-auto shrink-0 text-xs text-text-tertiary">
                                      {roleLabel(interviewer.role)}
                                    </span>
                                  </span>
                                </button>
                              ))
                            )}
                          </div>
                        )}

                        <Search
                          className="pointer-events-none absolute top-1/2 left-1.5 size-4 -translate-y-1/2 text-text-secondary"
                          aria-hidden="true"
                        />
                        <Input
                          id="edit-interviewer-search"
                          autoComplete="off"
                          placeholder="Buscar entrevistador…"
                          value={search}
                          onChange={(event) => setSearch(event.target.value)}
                          onFocus={() => setSearchFocused(true)}
                          onBlur={() => setSearchFocused(false)}
                          className={cn(fieldControl, "pl-6")}
                        />
                      </div>

                      {selected.length > 0 && (
                        <ul className="flex flex-wrap gap-2">
                          {selected.map((interviewer) => (
                            <li
                              key={interviewer.id}
                              className="flex items-center gap-2 rounded-full border border-border-default bg-surface-subtle py-1 pr-1 pl-1"
                            >
                              <span
                                className={cn(
                                  "flex size-6 items-center justify-center rounded-full text-[10px] font-semibold",
                                  getAvatar(
                                    interviewer.name,
                                    interviewer.lastName,
                                  ).colorClass,
                                )}
                              >
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
                                className="flex size-6 items-center justify-center rounded-full text-text-secondary hover:bg-surface-sunken hover:text-text-primary focus-visible:ring-2 focus-visible:ring-border-focus"
                              >
                                <X className="size-3.5" aria-hidden="true" />
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
          </div>

          <div className="flex justify-end gap-2 rounded-b-2xl border-t border-border-default bg-surface-subtle px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="rounded-full px-5"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="rounded-full bg-dashboard-dark px-5 text-text-on-dark hover:bg-dashboard-dark-hover"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Pencil className="size-4" />
              )}
              Guardar cambios
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
