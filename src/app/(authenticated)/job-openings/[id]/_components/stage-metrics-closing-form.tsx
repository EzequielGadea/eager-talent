"use client";

import { useEffect } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { CircleAlert } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { DatePicker } from "~/components/ui/date-picker";
import { DialogFooter } from "~/components/ui/dialog";
import { Skeleton } from "~/components/ui/skeleton";
import { getStageClosingDateError, toIsoDate } from "~/lib/stage-metrics";
import { api } from "~/lib/trpc/react";
import {
  stageClosingsSchema,
  type StageClosing,
} from "~/lib/validations/stage-metrics";

type StageMetricsClosingFormProps = {
  jobOpeningId: string;
  isBusy: boolean;
  onCancel: () => void;
  onConfirm: (stageClosings: StageClosing[]) => void;
};

function formatDays(days: number) {
  return `${days} ${days === 1 ? "día" : "días"}`;
}

// Reviews the metric stages before closing a job opening: stages that are
// still open get their closing date here. Target days are read-only (they are
// edited from "Editar vacante").
export function StageMetricsClosingForm({
  jobOpeningId,
  isBusy,
  onCancel,
  onConfirm,
}: StageMetricsClosingFormProps) {
  const stageMetricsQuery = api.jobOpening.getStageMetrics.useQuery(
    { jobOpeningId },
    { refetchOnMount: "always" },
  );
  const data = stageMetricsQuery.data;
  const stages = data?.stages ?? [];
  const pendingStages = stages.filter((stage) => !stage.closedAt);
  const today = toIsoDate(new Date());

  const formSchema = z
    .object({ closings: stageClosingsSchema })
    .superRefine((values, ctx) => {
      if (!data) return;

      // Validate with the dates entered for the other stages too (HR before
      // the technical stage).
      const stagesWithEnteredDates = stages.map((stage) => ({
        ...stage,
        closedAt:
          stage.closedAt ??
          values.closings.find(({ stageKey }) => stageKey === stage.key)
            ?.closedAt,
      }));

      values.closings.forEach((closing, index) => {
        const message = getStageClosingDateError({
          stages: stagesWithEnteredDates,
          stageKey: closing.stageKey,
          closedAt: closing.closedAt,
          openingDate: data.openingDate,
          today,
        });

        if (message) {
          ctx.addIssue({
            code: "custom",
            path: ["closings", index, "closedAt"],
            message,
          });
        }
      });
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { closings: [] },
  });
  const errors = form.formState.errors;

  useEffect(() => {
    if (!data) return;

    form.reset({
      closings: data.stages
        .filter((stage) => !stage.closedAt)
        .map((stage) => ({ stageKey: stage.key, closedAt: today })),
    });
  }, [data, form, today]);

  const stagesWithCandidates = pendingStages.filter(
    (stage) => stage.candidatesCount > 0,
  );
  const stagesWithoutTarget = stages.filter((stage) => !stage.targetDays);
  const canConfirm =
    Boolean(data) &&
    stagesWithCandidates.length === 0 &&
    stagesWithoutTarget.length === 0 &&
    !isBusy;

  return (
    <form
      className="flex flex-col gap-4"
      noValidate
      onSubmit={form.handleSubmit((values) => onConfirm(values.closings))}
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-text-primary">
          Etapas de las métricas de desvío
        </p>

        {stageMetricsQuery.isPending ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : stageMetricsQuery.isError ? (
          <p className="text-sm text-danger">
            {stageMetricsQuery.error.message}
          </p>
        ) : (
          stages.map((stage) => {
            const closingIndex = pendingStages.findIndex(
              ({ key }) => key === stage.key,
            );
            const closingError =
              closingIndex >= 0
                ? errors.closings?.[closingIndex]?.closedAt?.message
                : undefined;

            return (
              <div
                key={stage.key}
                className="flex flex-col gap-2 rounded-lg border border-border-default px-3 py-2"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate text-sm font-medium text-text-primary">
                    {stage.name}
                  </p>
                  <p className="shrink-0 text-xs text-text-secondary">
                    Objetivo:{" "}
                    {stage.targetDays
                      ? `${formatDays(stage.targetDays)} desde la apertura`
                      : "—"}
                  </p>
                </div>

                {stage.closedAt ? (
                  <p className="text-xs text-text-secondary">
                    Cerrada el {format(parseISO(stage.closedAt), "d/M/yyyy")}
                  </p>
                ) : stage.candidatesCount > 0 ? (
                  <p className="text-xs font-medium text-danger">
                    Pendiente de cierre: tiene{" "}
                    {stage.candidatesCount === 1
                      ? "1 candidato"
                      : `${stage.candidatesCount} candidatos`}
                  </p>
                ) : (
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor={`closing-${stage.key}`}
                      className="text-xs text-text-secondary"
                    >
                      Fecha de cierre de la etapa *
                    </label>
                    <Controller
                      control={form.control}
                      name={`closings.${closingIndex}.closedAt`}
                      render={({ field }) => (
                        <DatePicker
                          id={`closing-${stage.key}`}
                          name={field.name}
                          aria-label={`Fecha de cierre de ${stage.name}`}
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          ref={field.ref}
                          minValue={data?.openingDate}
                          maxValue={today}
                          isInvalid={!!closingError}
                          isDisabled={isBusy}
                        />
                      )}
                    />
                    {closingError && (
                      <p className="text-xs text-danger">{closingError}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        {stagesWithCandidates.length > 0 && (
          <div className="flex items-start gap-3 border-l-4 border-danger bg-danger-bg px-4 py-3 text-sm text-tag-red-fg">
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-danger" />
            <p>
              Para cerrar la vacante,{" "}
              {stagesWithCandidates.length === 1 ? "la etapa" : "las etapas"}{" "}
              <span className="font-semibold">
                {stagesWithCandidates.map((stage) => stage.name).join(", ")}
              </span>{" "}
              {stagesWithCandidates.length === 1 ? "no puede" : "no pueden"}{" "}
              tener candidatos. Movelos o descalificalos desde el{" "}
              <Link
                href={`/job-openings/${jobOpeningId}/pipeline`}
                className="font-semibold underline"
              >
                Pipeline
              </Link>
              .
            </p>
          </div>
        )}

        {stagesWithoutTarget.length > 0 && (
          <div className="flex items-start gap-3 border-l-4 border-danger bg-danger-bg px-4 py-3 text-sm text-tag-red-fg">
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-danger" />
            <p>
              Faltan los días objetivo de{" "}
              <span className="font-semibold">
                {stagesWithoutTarget.map((stage) => stage.name).join(", ")}
              </span>
              . Definilos desde{" "}
              <Link
                href={`/job-openings/${jobOpeningId}/edit`}
                className="font-semibold underline"
              >
                Editar vacante
              </Link>
              .
            </p>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          disabled={isBusy}
          onClick={onCancel}
        >
          Volver
        </Button>
        <Button type="submit" disabled={!canConfirm}>
          {isBusy ? "Confirmando..." : "Cerrar vacante"}
        </Button>
      </DialogFooter>
    </form>
  );
}
