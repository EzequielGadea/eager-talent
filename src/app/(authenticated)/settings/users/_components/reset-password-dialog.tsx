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

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userEmail: string;
};

export function ResetPasswordDialog({
  open,
  onOpenChange,
  userId,
  userEmail,
}: Props) {
  const resetMutation = api.user.sendPasswordReset.useMutation({
    onError: (error) => {
      toast.add({ title: error.message, type: "error" });
    },
    onSuccess: () => {
      onOpenChange(false);
      toast.add({
        type: "success",
        title: "Correo enviado",
        description: `Se envió el enlace de restablecimiento a ${userEmail}`,
      });
    },
  });

  const isPending = resetMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={isPending ? undefined : onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Restablecer contraseña</DialogTitle>
          <DialogDescription>
            Se enviará un correo a{" "}
            <span className="font-medium text-foreground">{userEmail}</span> con
            un enlace para definir una nueva contraseña. La contraseña actual no
            cambia hasta que el usuario complete el restablecimiento.
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
            onClick={() => resetMutation.mutate({ userId })}
            disabled={isPending}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {isPending ? "Enviando..." : "Enviar correo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
