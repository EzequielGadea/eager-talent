"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { api } from "~/lib/trpc/react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";

type DisqualifyCandidateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicantId: string;
  jobOpeningId: string;
  candidateName: string;
  onSuccess: () => void;
};

export function DisqualifyCandidateDialog({
  open,
  onOpenChange,
  applicantId,
  jobOpeningId,
  candidateName,
  onSuccess,
}: DisqualifyCandidateDialogProps) {
  const [reason, setReason] = useState("");

  const disqualifyMutation = api.application.disqualifyApplication.useMutation({
    onSuccess: () => {
      setReason("");
      onOpenChange(false);
      onSuccess();
    },
  });

  function handleConfirm() {
    if (!reason.trim()) return;
    disqualifyMutation.mutate({
      applicantId,
      jobOpeningId,
      reason: reason.trim(),
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setReason("");
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="w-full max-w-md gap-0 overflow-hidden p-0">
        <div className="border-b border-border-default px-6 py-5">
          <DialogTitle className="text-lg font-semibold text-text-primary">
            Descalificar candidato
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-text-secondary">
            {candidateName} va a salir del pipeline de esta vacante.
          </DialogDescription>
        </div>

        <div className="flex flex-col gap-3 px-6 py-5">
          <label className="text-sm font-medium text-text-primary">
            Motivo
          </label>
          <Input
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Ej. Perfil no relevante para la vacante"
          />
          {disqualifyMutation.isError && (
            <p className="text-sm text-danger">
              No se pudo descalificar al candidato.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-border-default px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={disqualifyMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={disqualifyMutation.isPending || !reason.trim()}
          >
            {disqualifyMutation.isPending && (
              <Loader2 className="size-4 animate-spin" />
            )}
            Descalificar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
