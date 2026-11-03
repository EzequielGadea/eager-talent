"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";

import { LogoutDialog } from "~/components/logout-dialog";
import { Button } from "~/components/ui/button";

export function LogoutButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <LogOut size={16} />
        Cerrar sesión
      </Button>

      <LogoutDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
