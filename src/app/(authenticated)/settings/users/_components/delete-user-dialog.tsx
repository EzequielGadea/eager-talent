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
  userId: string;
  userName: string;
};

export function DeleteUserDialog({
  open,
  onOpenChange,
  userId,
  userName,
}: Props) {
  const router = useRouter();
  const [isTransitionPending, startTransition] = useTransition();

  const deleteMutation = api.user.delete.useMutation({
    onError: (error) => {
      toast.add({ title: error.message, type: "error" });
    },
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
        onOpenChange(false);
        toast.add({
          type: "success",
          title: "Usuario eliminado",
          description: `${userName} fue eliminado del sistema`,
        });
      });
    },
  });

  const isPending = deleteMutation.isPending || isTransitionPending;

  return (
    <Dialog open={open} onOpenChange={isPending ? undefined : onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar usuario</DialogTitle>
          <DialogDescription>
            Esta acción es irreversible. {userName} será baneado, perderá el
            acceso al sistema y dejará de aparecer en todo el sistema. Su correo
            electrónico quedará liberado.
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
            onClick={() => deleteMutation.mutate({ userId })}
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
