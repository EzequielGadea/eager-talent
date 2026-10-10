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
import { Textarea } from "~/components/ui/textarea";

type DisqualifyCandidateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicantId: string;
  jobOpeningId: string;
  candidateName: string;
  candidateRole?: string | null;
  stageName: string;
  onSuccess: () => void;
};

export function DisqualifyCandidateDialog({
  open,
  onOpenChange,
  applicantId,
  jobOpeningId,
  candidateName,
  candidateRole,
  stageName,
  onSuccess,
}: DisqualifyCandidateDialogProps) {
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
      <DialogContent className="w-full gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[540px]">
        {/* Header: ícono rojo, título y contexto del candidato. */}
        <div className="flex items-start gap-3 border-b border-border-default px-[22px] py-5 pr-12">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#fcf2f2] text-[#ca3a31]">
            <CircleX className="size-4" />
          </div>

          <div className="min-w-0">
            <DialogTitle className="text-base font-semibold text-text-primary">
              Descalificar candidato
            </DialogTitle>

            <DialogDescription className="mt-0.5 text-[13px] text-text-secondary">
              {candidateName}
              {candidateRole && (
                <>
                  {" · "}
                  <span className="font-semibold text-text-primary">
                    {candidateRole}
                  </span>
                </>
              )}
              {" · "}
              {stageName}
            </DialogDescription>
          </div>
        </div>

        <div className="flex flex-col gap-5 px-[22px] py-5">
          {/* Motivo: opciones tipo radio en dos columnas. */}
          <div className="flex flex-col gap-2">
            <p
              id={motivesLabelId}
              className="text-xs font-medium text-text-secondary"
            >
              Motivo de descalificación{" "}
              <span className="text-[#ca3a31]">*</span>
            </p>

            {motivesQuery.isLoading && (
              <p className="text-xs text-text-secondary">Cargando motivos...</p>
            )}

            {motivesQuery.isError && (
              <p className="text-xs text-danger">
                No se pudieron cargar los motivos.
              </p>
            )}

            <div
              role="radiogroup"
              aria-labelledby={motivesLabelId}
              className="grid grid-cols-1 gap-2 sm:grid-cols-2"
            >
              {motivesQuery.data?.map((motive) => {
                const isSelected = motive.id === motiveId;

                return (
                  <button
                    key={motive.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    title={motive.name}
                    onClick={() => setMotiveId(motive.id)}
                    className={`flex h-10 items-center gap-2.5 rounded-lg border px-3 text-left text-[13px] transition-colors ${
                      isSelected
                        ? "border-[#dd524c] bg-[#fcf2f2] font-medium text-text-primary"
                        : "border-[#e3e8ef] text-text-primary hover:bg-accent"
                    }`}
                  >
                    <span
                      className={`flex size-[15px] shrink-0 items-center justify-center rounded-full border ${
                        isSelected
                          ? "border-[#dd524c] bg-[#dd524c]"
                          : "border-[#cbd5e1] bg-white"
                      }`}
                    >
                      {isSelected && (
                        <span className="size-1.5 rounded-full bg-white" />
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
          <div className="flex flex-col gap-2">
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
              className="min-h-[78px] resize-none text-[13px]"
            />
          </div>

          {disqualifyMutation.isError && (
            <p className="text-xs text-danger">
              No se pudo descalificar al candidato.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-border-default px-[22px] py-4">
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-full px-5 text-[13px]"
            onClick={() => onOpenChange(false)}
            disabled={disqualifyMutation.isPending}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            className="h-9 rounded-full bg-[#ca3a31] px-5 text-[13px] font-medium text-white hover:bg-[#b3322a] disabled:opacity-50"
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
