"use client";

import { Loader2 } from "lucide-react";

import { api } from "~/lib/trpc/react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~/components/ui/dialog";
import { toast } from "~/components/ui/toast";

type RequalifyApplicantDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicantId: string;
  jobOpeningId: string;
  applicantName: string;
  stageName: string;
  onSuccess: () => void;
};

export function RequalifyApplicantDialog({
  open,
  onOpenChange,
  applicantId,
  jobOpeningId,
  applicantName,
  stageName,
  onSuccess,
}: RequalifyApplicantDialogProps) {
  const requalifyMutation = api.application.requalifyApplication.useMutation({
    onSuccess: () => {
      toast.add({
        title: "Candidato recalificado correctamente",
        type: "success",
      });
      onOpenChange(false);
      onSuccess();
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);

        if (!nextOpen) {
          requalifyMutation.reset();
        }
      }}
    >
      <DialogContent className="w-full max-w-md gap-0 overflow-hidden p-0">
        <div className="px-6 py-5">
          <DialogTitle className="text-lg font-semibold text-text-primary">
            Volver a calificar
          </DialogTitle>

          <DialogDescription className="mt-1 text-sm text-text-secondary">
            ¿Querés volver a calificar a {applicantName}? La postulación
            regresará a la etapa «{stageName}» y se eliminará el motivo de
            descarte.
          </DialogDescription>

          {requalifyMutation.isError && (
            <p
              role="alert"
              className="mt-3 rounded-md border border-danger/30 bg-danger-bg px-3 py-2 text-sm text-danger"
            >
              {requalifyMutation.error.data?.code === "CONFLICT"
                ? requalifyMutation.error.message
                : "No se pudo volver a calificar la postulación."}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-border-default bg-surface-subtle px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="rounded-full px-5"
            onClick={() => {
              requalifyMutation.reset();
              onOpenChange(false);
            }}
            disabled={requalifyMutation.isPending}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            className="rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90"
            disabled={requalifyMutation.isPending}
            onClick={() =>
              requalifyMutation.mutate({ applicantId, jobOpeningId })
            }
          >
            {requalifyMutation.isPending && (
              <Loader2 className="size-4 animate-spin" />
            )}
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
