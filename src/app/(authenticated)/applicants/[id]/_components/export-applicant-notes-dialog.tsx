"use client";

import { Loader2 } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { toast } from "~/components/ui/toast";
import { api } from "~/lib/trpc/react";

type ExportApplicantNotesDialogProps = {
  applicantId: string;
  applicantName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ExportApplicantNotesDialog({
  applicantId,
  applicantName,
  open,
  onOpenChange,
}: ExportApplicantNotesDialogProps) {
  const exportMutation = api.applicant.exportInterviewNotes.useMutation({
    onError: (error) => {
      toast.add({
        type: "error",
        title: "No se pudieron exportar las notas",
        description: error.message,
      });
    },
    onSuccess: (result) => {
      if (result.status === "empty") {
        onOpenChange(false);
        toast.add({
          type: "info",
          title: "No hay notas para exportar",
          description: `${applicantName} no tiene entrevistas con notas registradas.`,
        });
        return;
      }

      try {
        downloadCsv(result.csv, result.filename);
        onOpenChange(false);
      } catch {
        toast.add({
          type: "error",
          title: "No se pudieron exportar las notas",
          description: "Ocurrió un error al iniciar la descarga.",
        });
      }
    },
  });

  const isPending = exportMutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isPending) return;
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exportar notas del candidato</DialogTitle>
          <DialogDescription>
            Se descargará un archivo CSV con las notas de todas las entrevistas
            de {applicantName}.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => exportMutation.mutate({ applicantId })}
            disabled={isPending}
          >
            {isPending && (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            )}
            {isPending ? "Exportando..." : "Exportar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function downloadCsv(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.hidden = true;
  document.body.append(anchor);

  try {
    anchor.click();
  } finally {
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}
