"use client";

import { ArrowRight } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { authClient } from "~/lib/auth/client";

type LogoutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function LogoutDialog({ open, onOpenChange }: LogoutDialogProps) {
  async function handleLogout() {
    await authClient.signOut();
    window.location.replace("/login");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-110 p-0 overflow-hidden text-card-foreground border shadow-2xl sm:max-w-110">
        <DialogHeader className="flex flex-row items-center justify-between px-5.5 py-4.5 border-b space-y-0">
          <DialogTitle className="m-0">Cerrar sesión</DialogTitle>
        </DialogHeader>

        <div className="p-5.5">
          <p className="text-sm text-muted-foreground">
            ¿Seguro que querés cerrar sesión? Tendrás que iniciar sesión
            nuevamente para volver a acceder.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 px-5.5 py-3.5 border-t bg-muted/30">
          <DialogClose
            render={
              <Button
                type="button"
                variant="outline"
                className="h-auto cursor-pointer rounded-full px-3.75 py-2 text-small font-semibold"
              >
                Cancelar
              </Button>
            }
          />
          <Button
            type="button"
            onClick={handleLogout}
            className="rounded-full font-semibold text-small h-auto px-4.25 py-2 bg-foreground text-background hover:bg-foreground/90 cursor-pointer"
          >
            Cerrar sesión
            <ArrowRight size={14} />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
