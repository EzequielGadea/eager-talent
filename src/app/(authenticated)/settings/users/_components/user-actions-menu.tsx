"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CircleX,
  KeyRound,
  LockKeyhole,
  LockOpen,
  MoreHorizontal,
  Trash2,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { toast } from "~/components/ui/toast";
import { authClient } from "~/lib/auth/client";

import { BanUserDialog } from "./ban-user-dialog";
import { DeleteUserDialog } from "./delete-user-dialog";
import { ResendInviteMenuItem } from "./resend-invite-button";
import type { User } from "./user-row";

type Props = {
  user: User;
};

type InviteRole = "recruiter" | "hiringManager";

const dangerItemClassName =
  "text-danger! hover:text-danger! focus:text-danger! data-highlighted:text-danger! [&_svg]:text-danger! hover:[&_svg]:text-danger! focus:[&_svg]:text-danger! data-highlighted:[&_svg]:text-danger!";

const successItemClassName =
  "text-success! hover:text-success! focus:text-success! data-highlighted:text-success! [&_svg]:text-success! hover:[&_svg]:text-success! focus:[&_svg]:text-success! data-highlighted:[&_svg]:text-success!";

export function UserActionsMenu({ user }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dialog, setDialog] = useState<"ban" | "delete" | null>(null);

  const fullName = `${user.name} ${user.lastName}`;

  const handleCancelInvitation = () => {
    const invitationId = user.pendingInvitationId;

    if (!invitationId) return;

    startTransition(async () => {
      const { error } = await authClient.organization.cancelInvitation({
        invitationId,
      });

      if (error) {
        toast.add({
          type: "error",
          title: "Error",
          description: error.message ?? "No se pudo cancelar la invitación",
        });

        return;
      }

      router.refresh();
      toast.add({
        type: "success",
        title: "Invitación cancelada",
        description: `Se canceló la invitación de ${user.email}`,
      });
    });
  };

  const handleUnban = () => {
    startTransition(async () => {
      const { error } = await authClient.admin.unbanUser({ userId: user.id });

      if (error) {
        toast.add({
          type: "error",
          title: "Error",
          description: error.message ?? "No se pudo desbanear al usuario",
        });

        return;
      }

      router.refresh();
      toast.add({
        type: "success",
        title: "Usuario desbaneado",
        description: `${fullName} puede acceder nuevamente al sistema`,
      });
    });
  };

  const deleteItem = (
    <DropdownMenuItem
      className={dangerItemClassName}
      onClick={() => setDialog("delete")}
    >
      <Trash2 className="size-4" />
      Eliminar usuario
    </DropdownMenuItem>
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex size-8 cursor-pointer items-center justify-center rounded-md hover:bg-slate-200"
          aria-label={`Acciones de ${fullName}`}
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          {user.status === "Active" && (
            <>
              <DropdownMenuItem>
                <KeyRound className="size-4" />
                Restablecer contraseña
              </DropdownMenuItem>

              <DropdownMenuItem
                className={dangerItemClassName}
                onClick={() => setDialog("ban")}
              >
                <LockKeyhole className="size-4" />
                Banear usuario
              </DropdownMenuItem>

              {deleteItem}
            </>
          )}

          {user.status === "Banned" && (
            <>
              <DropdownMenuItem
                className={successItemClassName}
                onClick={handleUnban}
                disabled={isPending}
              >
                <LockOpen className="size-4" />
                Desbanear usuario
              </DropdownMenuItem>

              {deleteItem}
            </>
          )}

          {user.status === "Inactive" && (
            <>
              <ResendInviteMenuItem
                email={user.email}
                role={user.role as InviteRole}
              />

              {deleteItem}
            </>
          )}

          {user.status === "PendingInvitation" && (
            <>
              <ResendInviteMenuItem
                email={user.email}
                role={user.role as InviteRole}
              />

              <DropdownMenuItem
                className={dangerItemClassName}
                onClick={handleCancelInvitation}
                disabled={isPending}
              >
                <CircleX className="size-4" />
                Cancelar invitación
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <BanUserDialog
        open={dialog === "ban"}
        onOpenChange={(open) => setDialog(open ? "ban" : null)}
        userId={user.id}
        userName={fullName}
      />

      <DeleteUserDialog
        open={dialog === "delete"}
        onOpenChange={(open) => setDialog(open ? "delete" : null)}
        userId={user.id}
        userName={fullName}
      />
    </>
  );
}
