"use client";

import type { inferRouterOutputs } from "@trpc/server";
import TimeAgo from "react-timeago";
import spanishStrings from "react-timeago/lib/language-strings/es";
import buildFormatter from "react-timeago/lib/formatters/buildFormatter";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { TableCell, TableRow } from "~/components/ui/table";
import type { AppRouter } from "~/server/api/root";

import { userRoleConfig, userStatusConfig } from "../constants";
import { UserActionsMenu } from "./user-actions-menu";

export type User =
  inferRouterOutputs<AppRouter>["user"]["getAllUsers"]["users"][number];

import getAvatar from "~/lib/avatar";

type Props = {
  user: User;
};

const baseSpanishFormatter = buildFormatter(spanishStrings);

const spanishFormatter: typeof baseSpanishFormatter = (
  value,
  unit,
  suffix,
  epochMilliseconds,
  nextFormatter,
  now,
) => {
  if (unit === "second") return "ahora mismo";
  return baseSpanishFormatter(
    value,
    unit,
    suffix === "from now" ? "ago" : suffix,
    epochMilliseconds,
    nextFormatter,
    now,
  );
};

const PENDING_NAME_LABEL = "Pendiente";

function LastAccessText({ lastAccess }: { lastAccess: string | null }) {
  if (!lastAccess) {
    return <span>—</span>;
  }

  const date = new Date(lastAccess);
  if (Number.isNaN(date.getTime())) {
    return <span>—</span>;
  }

  return (
    <TimeAgo
      date={date}
      formatter={spanishFormatter}
      title={format(date, "d MMM yyyy, HH:mm", { locale: es })}
      minPeriod={60}
      component={(props) => <time {...props} suppressHydrationWarning />}
    />
  );
}

export function UserRow({ user }: Props) {
  const status = userStatusConfig[user.status];

  const role =
    user.role === "recruiter"
      ? userRoleConfig.recruiter
      : userRoleConfig.hiringManager;

  const fullName = `${user.name} ${user.lastName}`.trim();

  const access =
    user.role === "recruiter"
      ? "Todo el sistema"
      : `${user.assignedJobOpeningsCount} ${
          user.assignedJobOpeningsCount === 1 ? "vacante" : "vacantes"
        }`;

  const avatar = getAvatar(user.name, user.lastName);

  return (
    <TableRow className="border-b border-border-default transition-colors last:border-b-0 hover:bg-success-bg">
      <TableCell className="px-4 py-3 pl-6">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-9 shrink-0 items-center justify-center rounded-full  text-xs font-semibold ${avatar.colorClass}`}
          >
            {avatar.initials || "?"}
          </div>

          {fullName ? (
            <span className="font-semibold text-text-primary">{fullName}</span>
          ) : (
            <span className="italic text-text-secondary">
              {PENDING_NAME_LABEL}
            </span>
          )}
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
        <LastAccessText lastAccess={user.lastAccess} />
      </TableCell>

      <TableCell className="px-4 py-3 text-right">
        <UserActionsMenu user={user} />
      </TableCell>
    </TableRow>
  );
}
