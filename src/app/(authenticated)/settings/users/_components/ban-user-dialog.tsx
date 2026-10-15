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
import { authClient } from "~/lib/auth/client";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
};

export function BanUserDialog({ open, onOpenChange, userId, userName }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      const { error } = await authClient.admin.banUser({ userId });

      if (error) {
        toast.add({
          type: "error",
          title: "Error",
          description: error.message ?? "No se pudo banear al usuario",
        });

        return;
      }

      router.refresh();
      onOpenChange(false);
      toast.add({
        type: "success",
        title: "Usuario baneado",
        description: `${userName} ya no puede acceder al sistema`,
      });
    });
  };

  return (
    <Dialog open={open} onOpenChange={isPending ? undefined : onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Banear usuario</DialogTitle>
          <DialogDescription>
            {userName} perderá el acceso al sistema y se cerrarán todas sus
            sesiones activas. Podés desbanearlo más adelante.
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
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {isPending ? "Baneando..." : "Banear"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
