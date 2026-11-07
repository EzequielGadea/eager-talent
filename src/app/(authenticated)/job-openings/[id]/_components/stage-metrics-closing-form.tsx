"use client";

import { useEffect } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { CircleAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { DialogFooter } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { getPendingMetricStages } from "~/lib/stage-metrics";
import { api } from "~/lib/trpc/react";
import {
  stageTargetsSchema,
  type StageTarget,
} from "~/lib/validations/stage-metrics";

const closingFormSchema = z.object({ targets: stageTargetsSchema });

type ClosingFormValues = z.infer<typeof closingFormSchema>;

type StageMetricsClosingFormProps = {
  jobOpeningId: string;
  isBusy: boolean;
  onCancel: () => void;
  onConfirm: (stageTargets: StageTarget[]) => void;
};

// Reviews the metric stages before closing a job opening: every stage must be
// closed, and the target days can still be changed.
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
  const stages = stageMetricsQuery.data;

  const form = useForm<ClosingFormValues>({
    resolver: zodResolver(closingFormSchema),
    defaultValues: { targets: [] },
  });
  const errors = form.formState.errors;

  useEffect(() => {
    if (!stages) return;

    form.reset({
      targets: stages.map((stage) => ({
        stageKey: stage.key,
        // An empty field shows the missing target instead of a fake value.
        targetDays: stage.targetDays ?? Number.NaN,
      })),
    });
  }, [stages, form]);

  const pendingStages = stages ? getPendingMetricStages(stages) : [];
  const canConfirm = Boolean(stages) && pendingStages.length === 0 && !isBusy;

  return (
    <form
      className="flex flex-col gap-4"
      noValidate
      onSubmit={form.handleSubmit((values) => onConfirm(values.targets))}
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-text-primary">
          Etapas de las métricas de desvío
        </p>

        {stageMetricsQuery.isPending ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : stageMetricsQuery.isError ? (
          <p className="text-sm text-danger">
            {stageMetricsQuery.error.message}
          </p>
        ) : (
          stages?.map((stage, index) => (
            <div
              key={stage.key}
              className="grid grid-cols-[minmax(0,1fr)_7rem] items-start gap-3 rounded-lg border border-border-default px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text-primary">
                  {stage.name}
                </p>
                {stage.closedAt ? (
                  <p className="text-xs text-text-secondary">
                    Cerrada el {format(parseISO(stage.closedAt), "d/M/yyyy")}
                  </p>
                ) : (
                  <p className="text-xs font-medium text-danger">
                    Pendiente de cierre
                  </p>
                )}
              </div>

              <Input
                type="number"
                inputMode="numeric"
                min={1}
                max={365}
                step={1}
                aria-label={`Días objetivo de la etapa ${stage.name}`}
                placeholder="Días"
                disabled={isBusy}
                errorMessage={errors.targets?.[index]?.targetDays?.message}
                {...form.register(`targets.${index}.targetDays`, {
                  valueAsNumber: true,
                })}
              />
            </div>
          ))
        )}

        {pendingStages.length > 0 && (
          <div className="flex items-start gap-3 border-l-4 border-danger bg-danger-bg px-4 py-3 text-sm text-tag-red-fg">
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-danger" />
            <p>
              Hay etapas requeridas para las métricas que todavía no fueron
              cerradas:{" "}
              <span className="font-semibold">
                {pendingStages.map((stage) => stage.name).join(", ")}
              </span>
              . Registrá su cierre desde el{" "}
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
