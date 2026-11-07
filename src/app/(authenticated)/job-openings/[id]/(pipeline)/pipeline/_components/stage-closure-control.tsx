"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Lock, LockOpen, MoreHorizontal } from "lucide-react";
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
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Label } from "~/components/ui/label";
import { toast } from "~/components/ui/toast";
import {
  getStageClosingDateError,
  toIsoDate,
  type MetricStageData,
} from "~/lib/stage-metrics";
import { api } from "~/lib/trpc/react";
import { closeStageSchema } from "~/lib/validations/stage-metrics";

// Closed/open status shown next to the stage name.
export function StageClosureBadge({ closedAt }: { closedAt: string | null }) {
  return closedAt ? (
    <Badge variant="secondary" className="bg-tag-red-bg text-tag-red-fg">
      Cerrada el {format(parseISO(closedAt), "d/M/yyyy")}
    </Badge>
  ) : (
    <Badge variant="secondary" className="bg-tag-green-bg text-tag-green-fg">
      Abierta
    </Badge>
  );
}

type StageClosureMenuProps = {
  jobOpeningId: string;
  stageKey: string;
  stageName: string;
  closedAt: string | null;
  // yyyy-MM-dd
  openingDate: string;
  stages: MetricStageData[];
  // A stage can only be closed once it has no candidates.
  hasCandidates: boolean;
};

// Three-dot menu next to the stage name with the close/reopen actions.
export function StageClosureMenu({
  jobOpeningId,
  stageKey,
  stageName,
  closedAt,
  openingDate,
  stages,
  hasCandidates,
}: StageClosureMenuProps) {
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

  function openCloseDialog() {
    form.reset({ closedAt: today });
    setIsDialogOpen(true);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          type="button"
          disabled={isBusy}
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-text-secondary hover:bg-accent hover:text-text-primary"
          aria-label={`Acciones de la etapa ${stageName}`}
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-60">
          {closedAt ? (
            <DropdownMenuItem
              onClick={() => reopenStage.mutate({ jobOpeningId, stageKey })}
            >
              <LockOpen className="size-4" />
              <span>Reabrir etapa</span>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              disabled={hasCandidates}
              onClick={openCloseDialog}
              className="items-start"
            >
              <Lock className="mt-0.5 size-4" />
              <span className="flex flex-col">
                <span>Cerrar etapa</span>
                {hasCandidates && (
                  <span className="text-xs text-text-tertiary">
                    Para cerrarla no puede tener candidatos.
                  </span>
                )}
              </span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!isBusy) setIsDialogOpen(open);
        }}
      >
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
                <p className="text-xs text-danger">{errors.closedAt.message}</p>
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
    </>
  );
}
