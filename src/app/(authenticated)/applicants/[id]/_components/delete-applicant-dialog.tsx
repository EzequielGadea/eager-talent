"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
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

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicantId: string;
  applicantName: string;
};

export function DeleteApplicantDialog({
  open,
  onOpenChange,
  applicantId,
  applicantName,
}: Props) {
  const router = useRouter();
  const [isTransitionPending, startTransition] = useTransition();

  const deleteMutation = api.applicant.delete.useMutation({
    onError: (error) => {
      toast.add({ title: error.message, type: "error" });
    },
    onSuccess: () => {
      toast.add({
        type: "success",
        title: "Candidato eliminado",
        description: `${applicantName} fue eliminado del sistema`,
      });

      onOpenChange(false);
      startTransition(() => {
        router.push("/applicants");
        router.refresh();
      });
    },
  });

  const isPending = deleteMutation.isPending || isTransitionPending;

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
          <DialogTitle>Eliminar candidato</DialogTitle>
          <DialogDescription>
            Esta acción es irreversible. {applicantName} dejará de aparecer en
            todo el sistema y también se eliminarán sus postulaciones,
            entrevistas y notas asociadas. Sus enlaces públicos dejarán de
            funcionar.
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
            variant="destructive"
            onClick={() => deleteMutation.mutate({ id: applicantId })}
            disabled={isPending}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {isPending ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
