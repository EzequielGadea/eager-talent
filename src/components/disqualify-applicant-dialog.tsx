"use client";

import { useId, useState } from "react";
import { CircleX, Loader2 } from "lucide-react";

import { api } from "~/lib/trpc/react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~/components/ui/dialog";
import { Skeleton } from "~/components/ui/skeleton";
import { Textarea } from "~/components/ui/textarea";
import { toast } from "~/components/ui/toast";

type DisqualifyApplicantDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicantId: string;
  jobOpeningId: string;
  candidateName: string;
  jobOpeningName: string;
  stageName: string;
  onSuccess: () => void;
};

export function DisqualifyApplicantDialog({
  open,
  onOpenChange,
  applicantId,
  jobOpeningId,
  candidateName,
  jobOpeningName,
  stageName,
  onSuccess,
}: DisqualifyApplicantDialogProps) {
  const [motiveId, setMotiveId] = useState("");
  const [description, setDescription] = useState("");

  const motivesLabelId = useId();
  const commentId = useId();

  const motivesQuery = api.application.fetchDisqualificationMotives.useQuery(
    undefined,
    { enabled: open },
  );

  function resetForm() {
    setMotiveId("");
    setDescription("");
  }

  const disqualifyMutation = api.application.disqualifyApplication.useMutation({
    onSuccess: () => {
      toast.add({
        title: "Candidato descalificado correctamente",
        type: "success",
      });
      resetForm();
      onOpenChange(false);
      onSuccess();
    },
  });

  function handleConfirm() {
    if (!motiveId) return;

    disqualifyMutation.mutate({
      applicantId,
      jobOpeningId,
      motiveId,
      description: description.trim() || undefined,
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          resetForm();
          disqualifyMutation.reset();
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="flex max-h-[90vh] w-full min-w-0 flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[540px]">
        {/* Header: ícono rojo, título y contexto del candidato. */}
        <div className="flex shrink-0 items-start gap-3 border-b border-border-default px-[22px] py-5 pr-12">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-danger-bg text-danger">
            <CircleX className="size-4" />
          </div>

          <div className="min-w-0">
            <DialogTitle className="text-h3 text-text-primary">
              Descalificar candidato
            </DialogTitle>

            <DialogDescription className="mt-0.5 text-small text-text-secondary">
              {candidateName}
              {" · "}
              <span className="font-semibold text-text-primary">
                {jobOpeningName}
              </span>
              {" · "}
              {stageName}
            </DialogDescription>
          </div>
        </div>

        <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-5 overflow-x-hidden overflow-y-auto px-[22px] py-5">
          {/* Motivo: opciones tipo radio en dos columnas. */}
          <div className="flex flex-col gap-2">
            <p
              id={motivesLabelId}
              className="text-xs font-medium text-text-secondary"
            >
              Motivo de descalificación <span className="text-danger">*</span>
            </p>

            {motivesQuery.isError && (
              <p
                role="alert"
                className="rounded-md border border-danger/30 bg-danger-bg px-3 py-2 text-sm text-danger"
              >
                No se pudieron cargar los motivos.
              </p>
            )}

            <div
              role="radiogroup"
              aria-labelledby={motivesLabelId}
              className="grid grid-cols-1 gap-2 sm:grid-cols-2"
            >
              {motivesQuery.isLoading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-10 w-full rounded-lg" />
                  ))
                : motivesQuery.data?.map((motive) => {
                    const isSelected = motive.id === motiveId;

                    return (
                      <button
                        key={motive.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        title={motive.name}
                        onClick={() => setMotiveId(motive.id)}
                        className={`flex h-10 items-center gap-2.5 rounded-lg border px-3 text-left text-small transition-colors ${
                          isSelected
                            ? "border-danger bg-danger-bg font-medium text-text-primary"
                            : "border-border-default text-text-primary hover:bg-accent"
                        }`}
                      >
                        <span
                          className={`flex size-[15px] shrink-0 items-center justify-center rounded-full border ${
                            isSelected
                              ? "border-danger bg-danger"
                              : "border-border-strong bg-surface-card"
                          }`}
                        >
                          {isSelected && (
                            <span className="size-1.5 rounded-full bg-surface-card" />
                          )}
                        </span>

                        <span className="min-w-0 flex-1 truncate">
                          {motive.name}
                        </span>
                      </button>
                    );
                  })}
            </div>
          </div>

          {/* Comentario opcional. */}
          <div className="flex w-full min-w-0 flex-col gap-2">
            <label
              htmlFor={commentId}
              className="text-xs font-semibold text-text-primary"
            >
              Comentario{" "}
              <span className="font-normal text-text-secondary">
                (opcional)
              </span>
            </label>

            <Textarea
              id={commentId}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Escribí un detalle para el equipo..."
              rows={3}
              className="h-[120px] w-full min-w-0 max-w-full resize-none overflow-x-hidden overflow-y-auto text-small whitespace-pre-wrap [field-sizing:fixed] [overflow-wrap:anywhere]"
            />
          </div>

          {disqualifyMutation.isError && (
            <p
              role="alert"
              className="rounded-md border border-danger/30 bg-danger-bg px-3 py-2 text-sm text-danger"
            >
              No se pudo descalificar al candidato.
            </p>
          )}
        </div>

        <div className="flex w-full min-w-0 shrink-0 justify-end gap-2 border-t border-border-default px-[22px] py-4">
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-full px-5 text-small"
            onClick={() => {
              resetForm();
              disqualifyMutation.reset();
              onOpenChange(false);
            }}
            disabled={disqualifyMutation.isPending}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            className="h-9 rounded-full bg-danger px-5 text-small font-medium text-text-on-dark hover:bg-danger/90 disabled:opacity-50"
            onClick={handleConfirm}
            disabled={disqualifyMutation.isPending || !motiveId}
          >
            {disqualifyMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CircleX className="size-4" />
            )}
            Descalificar candidato
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
