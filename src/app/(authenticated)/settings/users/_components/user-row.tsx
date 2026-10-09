import type { inferRouterOutputs } from "@trpc/server";
import { MoreHorizontal, KeyRound, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import { Button } from "~/components/ui/button";
import { TableCell, TableRow } from "~/components/ui/table";
import type { AppRouter } from "~/server/api/root";

import { userRoleConfig, userStatusConfig } from "../constants";

export type User = inferRouterOutputs<AppRouter>["user"]["getAllUsers"][number];

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
        {user.status === "PendingInvitation" ? (
          <Button
            type="button"
            variant="ghost"
            className="h-8 px-2 text-xs font-medium text-text-link"
          >
            Reenviar invitación
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex size-8 items-center cursor-pointer justify-center rounded-md hover:bg-slate-200"
              aria-label={`Acciones de ${user.name} ${user.lastName}`}
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem>
                <KeyRound className="size-4" />
                Restablecer contraseña
              </DropdownMenuItem>

              <DropdownMenuItem className="text-danger focus:text-danger">
                <Trash2 className="size-4" />
                Eliminar usuario
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </TableCell>
    </TableRow>
  );
}
