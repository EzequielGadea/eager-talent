"use client";

import { LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";

import { Button } from "~/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { authClient } from "~/lib/auth/client";

type UserMenuProps = {
  children: ReactNode;
  side?: "top" | "bottom";
};

export function UserMenu({ children, side = "top" }: UserMenuProps) {
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  async function handleSignOut() {
    await authClient.signOut();
    window.location.replace("/login");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="flex w-full items-center gap-2.5 rounded-md p-1 text-left hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-border-focus data-popup-open:bg-surface-hover"
          />
        }
      >
        {children}
      </DropdownMenuTrigger>

      {/* min-w-max keeps items on one line when the trigger is only the avatar. */}
      <DropdownMenuContent side={side} sideOffset={8} className="min-w-max">
        <DropdownMenuItem render={<Link href="/profile" />} className="gap-2">
          <UserRound aria-hidden="true" />
          <span>Perfil</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          className="gap-2"
          onClick={() => setIsLogoutDialogOpen(true)}
        >
          <LogOut aria-hidden="true" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>

      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent className="max-w-110 overflow-hidden border bg-card p-0 text-card-foreground shadow-2xl sm:max-w-110">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 border-b px-5.5 py-4.5">
            <DialogTitle className="m-0 text-base font-bold tracking-tight">
              Cerrar sesión
            </DialogTitle>
          </DialogHeader>

          <div className="p-5.5">
            <p className="text-sm text-muted-foreground">
              ¿Seguro que querés cerrar sesión? Tendrás que iniciar sesión
              nuevamente para volver a acceder.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 border-t bg-muted/30 px-5.5 py-3.5">
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  className="h-auto rounded-full px-3.75 py-2 text-[13px] font-semibold"
                >
                  Cancelar
                </Button>
              }
            />
            <Button
              type="button"
              onClick={handleSignOut}
              className="h-auto cursor-pointer rounded-full bg-foreground px-4.25 py-2 text-[13px] font-semibold text-background hover:bg-foreground/90"
            >
              Cerrar sesión
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  );
}
