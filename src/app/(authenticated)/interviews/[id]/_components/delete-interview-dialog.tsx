"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~/components/ui/dialog";
import { toast } from "~/components/ui/toast";
import { api } from "~/lib/trpc/react";

type DeleteInterviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interviewId: string;
  interviewName: string;
  applicantId: string;
};

export function DeleteInterviewDialog({
  open,
  onOpenChange,
  interviewId,
  interviewName,
  applicantId,
}: DeleteInterviewDialogProps) {
  const router = useRouter();
  const [isRedirecting, startTransition] = useTransition();

  const deleteInterview = api.interview.delete.useMutation({
    onError: (error) => {
      toast.add({ title: error.message, type: "error" });
    },
    onSuccess: () => {
      toast.add({
        title: "Entrevista eliminada correctamente",
        type: "success",
      });

      // The interview page no longer exists, so go back to the applicant.
      startTransition(() => {
        router.push(`/applicants/${applicantId}`);
      });
    },
  });

  const isPending = deleteInterview.isPending || isRedirecting;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isPending) return;
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="w-full max-w-md gap-0 overflow-hidden p-0">
        <div className="border-b border-border-default px-6 py-5">
          <DialogTitle className="text-lg font-semibold text-text-primary">
            Eliminar entrevista
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-text-secondary">
            Vas a eliminar la entrevista &quot;{interviewName}&quot; junto con
            sus notas. Esta acción no se puede deshacer.
          </DialogDescription>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4">
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
            onClick={() => deleteInterview.mutate({ interviewId })}
            disabled={isPending}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {isPending ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
