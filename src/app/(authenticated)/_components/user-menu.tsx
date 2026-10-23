"use client";

import { LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { authClient } from "~/lib/auth/client";

type UserMenuProps = {
  children: ReactNode;
  side?: "top" | "bottom";
};

export function UserMenu({ children, side = "top" }: UserMenuProps) {
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
          onClick={handleSignOut}
        >
          <LogOut aria-hidden="true" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
