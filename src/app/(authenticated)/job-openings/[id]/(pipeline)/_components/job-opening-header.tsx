import { TZDate } from "@date-fns/tz";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";

import { Button } from "~/components/ui/button";
import { JobOpeningStatus } from "~/generated/prisma/enums";

import { AddApplicantDialog } from "./add-applicant-dialog";
import { JobOpeningStatusDropdown } from "./job-opening-status-dropdown";

type JobOpeningHeaderProps = {
  jobOpeningId: string;
  name: string;
  status: JobOpeningStatus;
  areaName: string;
  openingDate: Date;
  canCreateApplication: boolean;
  canUpdateJobOpening: boolean;
};

function getDaysSince(date: Date) {
  const nowInUruguay = new TZDate(new Date(), "America/Montevideo");
  const todayUtc = Date.UTC(
    nowInUruguay.getFullYear(),
    nowInUruguay.getMonth(),
    nowInUruguay.getDate(),
  );
  const openingUtc = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  return Math.round((todayUtc - openingUtc) / millisecondsPerDay);
}

function getOpeningLabel(openingDate: Date) {
  const daysSince = getDaysSince(openingDate);

  if (daysSince < 0) {
    const formattedDate = new Intl.DateTimeFormat("es-UY", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(openingDate));

    return `Fecha de apertura: ${formattedDate}`;
  }

  if (daysSince === 0) {
    return "Abierta hoy";
  }

  if (daysSince === 1) {
    return "Abierta hace 1 día";
  }

  return `Abierta hace ${daysSince} días`;
}

export function JobOpeningHeader({
  jobOpeningId,
  name,
  status,
  areaName,
  openingDate,
  canCreateApplication,
  canUpdateJobOpening,
}: JobOpeningHeaderProps) {
  const isLocked =
    status === JobOpeningStatus.Closed || status === JobOpeningStatus.Cancelled;

  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href="/job-openings"
          aria-label="Volver a vacantes"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-md hover:bg-accent"
        >
          <ArrowLeft className="size-4" />
        </Link>

        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="truncate text-xl font-semibold text-text-primary">
              {name}
            </h1>

            <JobOpeningStatusDropdown
              jobOpeningId={jobOpeningId}
              status={status}
              canUpdate={canUpdateJobOpening && !isLocked}
            />
          </div>

          <p className="text-sm text-text-secondary">
            {areaName} · {getOpeningLabel(openingDate)}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {canUpdateJobOpening &&
          (isLocked ? (
            <Button
              type="button"
              variant="outline"
              disabled
              className="h-10 shrink-0 gap-2 whitespace-nowrap rounded-md px-4 text-sm font-medium"
            >
              <Pencil className="size-4 shrink-0" />
              <span>Editar</span>
            </Button>
          ) : (
            <Link
              href={`/job-openings/${jobOpeningId}/edit`}
              className="inline-flex h-10 shrink-0 flex-row items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Pencil className="size-4 shrink-0" />
              <span>Editar</span>
            </Link>
          ))}

        {canCreateApplication && (
          <AddApplicantDialog
            jobOpeningId={jobOpeningId}
            disabled={status !== JobOpeningStatus.Open}
          />
        )}
      </div>
    </header>
  );
}
