"use client";

import { useTransition } from "react";
import { format } from "date-fns";
import { Download, Loader2 } from "lucide-react";

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

function downloadCsvFile(csvContent: string, fileName: string) {
  const blob = new Blob(["\uFEFF", csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function ExportApplicantsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isTransitionPending, startTransition] = useTransition();

  const exportMutation = api.applicant.exportApplicants.useMutation({
    onError: (error) => {
      toast.add({
        title: error.message || "No se pudieron exportar los candidatos.",
        type: "error",
      });
    },
    onSuccess: (data) => {
      try {
        const fileName = `candidatos-${format(new Date(), "yyyy-MM-dd")}.csv`;
        downloadCsvFile(data.csv, fileName);

        toast.add({
          title: "Candidatos exportados correctamente",
          type: "success",
        });

        startTransition(() => {
          onOpenChange(false);
        });
      } catch {
        toast.add({
          title: "Ocurrió un error al descargar el archivo CSV.",
          type: "error",
        });
      }
    },
  });

  const isPending = exportMutation.isPending || isTransitionPending;

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
          <DialogTitle>Exportar candidatos</DialogTitle>
          <DialogDescription>
            Se descargará un archivo en formato CSV con la información de todos
            los candidatos existentes en la plataforma. ¿Querés confirmar la
            exportación?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={isPending}
            onClick={() => exportMutation.mutate({})}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="size-4" />
                Confirmar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

