import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";

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
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const difference = Date.now() - date.getTime();

  return Math.max(0, Math.floor(difference / millisecondsPerDay));
}

function getOpeningLabel(openingDate: Date) {
  const daysSince = getDaysSince(openingDate);

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
  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href="/job-opening"
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
              canUpdate={canUpdateJobOpening}
            />
          </div>

          <p className="text-sm text-text-secondary">
            {areaName} · {getOpeningLabel(openingDate)}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {canUpdateJobOpening && (
          <Link
            href={`/job-opening/${jobOpeningId}/edit`}
            className="inline-flex h-10 shrink-0 flex-row items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Pencil className="size-4 shrink-0" />
            <span>Editar</span>
          </Link>
        )}

        {canCreateApplication && (
          <AddApplicantDialog jobOpeningId={jobOpeningId} />
        )}
      </div>
    </header>
  );
}
