import { CircleAlert } from "lucide-react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Card } from "~/components/ui/card";
import type { DisqualifiedApplication } from "./types";

const avatarColors = [
  "bg-dashboard-orange-light text-dashboard-orange-text",
  "bg-dashboard-sky-avatar text-dashboard-sky-text",
  "bg-dashboard-success-avatar text-dashboard-success-text",
  "bg-tag-gray-bg text-tag-gray-fg",
  "bg-tag-blue-bg text-tag-blue-fg",
  "bg-dashboard-purple-avatar text-dashboard-purple-text",
  "bg-tag-amber-bg text-tag-amber-fg",
];

function getAvatarColor(id: string) {
  const hash = id
    .split("")
    .reduce((total, character) => total + character.charCodeAt(0), 0);

  return avatarColors[hash % avatarColors.length];
}

type DisqualifiedCardProps = {
  application: DisqualifiedApplication;
};

export function DisqualifiedCard({ application }: DisqualifiedCardProps) {
  const disqualifiedAt = new Date(application.disqualificationDate);
  const fullName = `${application.name} ${application.lastName}`;
  const initials =
    `${application.name.charAt(0)}${application.lastName.charAt(0)}`.toUpperCase();

  return (
    <Link href={`/applicants/${application.applicantId}`} className="block">
      {/* Borde izquierdo rojo"*/}
      <Card className="rounded-xl border-border-default border-l-4 border-l-destructive bg-card p-3 shadow-none transition-colors hover:bg-accent">
        <div className="flex items-center gap-3">
          <Avatar className="size-9 shrink-0">
            <AvatarImage src={application.photo ?? undefined} alt={fullName} />
            <AvatarFallback className={getAvatarColor(application.applicantId)}>
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text-primary">
              {fullName}
            </p>
            <p className="truncate text-xs text-text-secondary">
              {application.role}
            </p>
          </div>
        </div>

        {/* Separador, motivo en rojo y tiempo transcurrido. */}
        <div className="mt-3 flex flex-col gap-1 border-t border-border-default pt-3">
          {application.disqualificationReason && (
            <p className="flex items-start gap-1.5 text-sm text-destructive">
              <CircleAlert className="mt-0.5 size-3.5 shrink-0" />
              <span className="line-clamp-2">
                {application.disqualificationReason}
              </span>
            </p>
          )}

          {/* La fecha exacta al pasar el mouse. */}
          <p
            className="text-xs text-text-secondary"
            title={format(disqualifiedAt, "d 'de' MMMM yyyy · HH:mm", {
              locale: es,
            })}
          >
            Descartado{" "}
            {formatDistanceToNow(disqualifiedAt, {
              locale: es,
              addSuffix: true,
            })}
          </p>
        </div>
      </Card>
    </Link>
  );
}
