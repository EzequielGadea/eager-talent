"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { DatePicker } from "~/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { toast } from "~/components/ui/toast";
import {
  getStageClosingDateError,
  toIsoDate,
  type MetricStageData,
} from "~/lib/stage-metrics";
import { api } from "~/lib/trpc/react";
import { closeStageSchema } from "~/lib/validations/stage-metrics";

type StageClosureControlProps = {
  jobOpeningId: string;
  stageKey: string;
  stageName: string;
  closedAt: string | null;
  // yyyy-MM-dd
  openingDate: string;
  stages: MetricStageData[];
  canManage: boolean;
};

export function StageClosureControl({
  jobOpeningId,
  stageKey,
  stageName,
  closedAt,
  openingDate,
  stages,
  canManage,
}: StageClosureControlProps) {
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const today = toIsoDate(new Date());

  const formSchema = z
    .object({ closedAt: closeStageSchema.shape.closedAt })
    .superRefine((data, ctx) => {
      const message = getStageClosingDateError({
        stages,
        stageKey,
        closedAt: data.closedAt,
        openingDate,
        today,
      });

      if (message) {
        ctx.addIssue({ code: "custom", path: ["closedAt"], message });
      }
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { closedAt: today },
  });

  const closeStage = api.jobOpening.closeStage.useMutation({
    onSuccess: () => {
      startTransition(() => {
        setIsDialogOpen(false);
        router.refresh();
      });
    },
    onError: (error) => {
      toast.add({ title: error.message, type: "error" });
    },
  });

  const reopenStage = api.jobOpening.reopenStage.useMutation({
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
      });
    },
    onError: (error) => {
      toast.add({ title: error.message, type: "error" });
    },
  });

  const isBusy = closeStage.isPending || reopenStage.isPending || isRefreshing;
  const errors = form.formState.errors;

  function handleOpenChange(open: boolean) {
    if (isBusy) return;

    if (open) {
      form.reset({ closedAt: today });
    }

    setIsDialogOpen(open);
  }

  return (
    <div className="flex items-center justify-between gap-2">
      {closedAt ? (
        <Badge variant="secondary" className="bg-success-bg text-success">
          Etapa cerrada el {format(parseISO(closedAt), "d/M/yyyy")}
        </Badge>
      ) : (
        <Badge variant="secondary">Etapa abierta</Badge>
      )}

      {canManage &&
        (closedAt ? (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            disabled={isBusy}
            onClick={() => reopenStage.mutate({ jobOpeningId, stageKey })}
          >
            {reopenStage.isPending || isRefreshing
              ? "Reabriendo..."
              : "Reabrir etapa"}
          </Button>
        ) : (
          <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger
              render={
                <Button type="button" variant="outline" size="xs">
                  Cerrar etapa
                </Button>
              }
            />
            <DialogContent>
              <form
                className="flex flex-col gap-4"
                noValidate
                onSubmit={form.handleSubmit((values) =>
                  closeStage.mutate({
                    jobOpeningId,
                    stageKey,
                    closedAt: values.closedAt,
                  }),
                )}
              >
                <DialogHeader>
                  <DialogTitle>Cerrar etapa {stageName}</DialogTitle>
                  <DialogDescription>
                    Registrá la fecha real de cierre de la etapa. Se usa para
                    calcular el desvío de la etapa en las métricas.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-2">
                  <Label htmlFor={`stage-closed-at-${stageKey}`}>
                    Fecha de cierre <span className="text-danger">*</span>
                  </Label>
                  <Controller
                    control={form.control}
                    name="closedAt"
                    render={({ field }) => (
                      <DatePicker
                        id={`stage-closed-at-${stageKey}`}
                        name={field.name}
                        aria-label="Fecha de cierre de la etapa"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        minValue={openingDate}
                        maxValue={today}
                        isInvalid={!!errors.closedAt}
                      />
                    )}
                  />
                  {errors.closedAt?.message && (
                    <p className="text-xs text-danger">
                      {errors.closedAt.message}
                    </p>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isBusy}
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Volver
                  </Button>
                  <Button type="submit" disabled={isBusy}>
                    {isBusy ? "Guardando..." : "Cerrar etapa"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        ))}
    </div>
  );
}
