import type { inferRouterOutputs } from "@trpc/server";
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

import { TableCell, TableRow } from "~/components/ui/table";
import type { AppRouter } from "~/server/api/root";

import { userRoleConfig, userStatusConfig } from "../constants";
import { ResendInviteMenuItem } from "./resend-invite-button";

export type User = inferRouterOutputs<AppRouter>["user"]["getAllUsers"][number];

type InviteRole = "recruiter" | "hiringManager";

type Props = {
  user: User;
};

function getInitials(name: string, lastName: string) {
  return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function formatLastAccess(lastAccess: string | null) {
  if (!lastAccess) {
    return "—";
  }

  const lastAccessDate = new Date(lastAccess);
  const now = new Date();

  const diffInMilliseconds = now.getTime() - lastAccessDate.getTime();
  const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));

  if (diffInMinutes < 1) {
    return "Ahora";
  }

  if (diffInMinutes < 60) {
    return `Hace ${diffInMinutes} min`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);

  if (diffInHours < 24) {
    return `Hace ${diffInHours} ${diffInHours === 1 ? "hora" : "horas"}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays < 7) {
    return `Hace ${diffInDays} ${diffInDays === 1 ? "día" : "días"}`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);

  if (diffInDays < 30) {
    return `Hace ${diffInWeeks} ${diffInWeeks === 1 ? "semana" : "semanas"}`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);

  if (diffInDays < 365) {
    return `Hace ${diffInMonths} ${diffInMonths === 1 ? "mes" : "meses"}`;
  }

  const diffInYears = Math.floor(diffInDays / 365);

  return `Hace ${diffInYears} ${diffInYears === 1 ? "año" : "años"}`;
}

export function UserRow({ user }: Props) {
  const status = userStatusConfig[user.status];

  const role =
    user.role === "recruiter"
      ? userRoleConfig.recruiter
      : userRoleConfig.hiringManager;

  const access =
    user.role === "recruiter"
      ? "Todo el sistema"
      : `${user.assignedJobOpeningsCount} ${
          user.assignedJobOpeningsCount === 1 ? "vacante" : "vacantes"
        }`;

  return (
    <TableRow className="border-b border-border-default last:border-b-0">
      <TableCell className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-tag-purple-bg text-xs font-semibold text-tag-purple-fg">
            {getInitials(user.name, user.lastName)}
          </div>

          <span className="font-semibold text-text-primary">
            {user.name} {user.lastName}
          </span>
        </div>
      </TableCell>

      <TableCell className="px-4 py-3 text-text-secondary">
        {user.email}
      </TableCell>

      <TableCell className="px-4 py-3">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${role.className}`}
        >
          {role.label}
        </span>
      </TableCell>

      <TableCell className="px-4 py-3 text-text-secondary">{access}</TableCell>

      <TableCell className="px-4 py-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
        >
          <span className="size-1.5 rounded-full bg-current" />
          {status.label}
        </span>
      </TableCell>

      <TableCell className="px-4 py-3 text-text-secondary">
        {formatLastAccess(user.lastAccess)}
      </TableCell>

      <TableCell className="px-4 py-3 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex size-8 cursor-pointer items-center justify-center rounded-md hover:bg-slate-200"
            aria-label={`Acciones de ${user.name} ${user.lastName}`}
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

                <DropdownMenuItem className="text-danger! hover:text-danger! focus:text-danger! data-highlighted:text-danger! [&_svg]:text-danger! hover:[&_svg]:text-danger! focus:[&_svg]:text-danger! data-highlighted:[&_svg]:text-danger!">
                  <LockKeyhole className="size-4" />
                  Banear usuario
                </DropdownMenuItem>

                <DropdownMenuItem className="text-danger! hover:text-danger! focus:text-danger! data-highlighted:text-danger! [&_svg]:text-danger! hover:[&_svg]:text-danger! focus:[&_svg]:text-danger! data-highlighted:[&_svg]:text-danger!">
                  <Trash2 className="size-4" />
                  Eliminar usuario
                </DropdownMenuItem>
              </>
            )}

            {user.status === "Banned" && (
              <>
                <DropdownMenuItem className="text-success! hover:text-success! focus:text-success! data-highlighted:text-success! [&_svg]:text-success! hover:[&_svg]:text-success! focus:[&_svg]:text-success! data-highlighted:[&_svg]:text-success!">
                  <LockOpen className="size-4" />
                  Desbanear usuario
                </DropdownMenuItem>

                <DropdownMenuItem className="text-danger! hover:text-danger! focus:text-danger! data-highlighted:text-danger! [&_svg]:text-danger! hover:[&_svg]:text-danger! focus:[&_svg]:text-danger! data-highlighted:[&_svg]:text-danger!">
                  <Trash2 className="size-4" />
                  Eliminar usuario
                </DropdownMenuItem>
              </>
            )}

            {user.status === "Inactive" && (
              <>
                <ResendInviteMenuItem
                  email={user.email}
                  role={user.role as InviteRole}
                />

                <DropdownMenuItem className="text-danger! hover:text-danger! focus:text-danger! data-highlighted:text-danger! [&_svg]:text-danger! hover:[&_svg]:text-danger! focus:[&_svg]:text-danger! data-highlighted:[&_svg]:text-danger!">
                  <Trash2 className="size-4" />
                  Eliminar usuario
                </DropdownMenuItem>
              </>
            )}

            {user.status === "PendingInvitation" && (
              <>
                <ResendInviteMenuItem
                  email={user.email}
                  role={user.role as InviteRole}
                />

                <DropdownMenuItem className="text-danger! hover:text-danger! focus:text-danger! data-highlighted:text-danger! [&_svg]:text-danger! hover:[&_svg]:text-danger! focus:[&_svg]:text-danger! data-highlighted:[&_svg]:text-danger!">
                  <CircleX className="size-4" />
                  Cancelar invitación
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
