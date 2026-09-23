import { ArrowLeft, ChevronDown, Pencil } from "lucide-react";
import Link from "next/link";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

import { AddApplicantDialog } from "./add-applicant-dialog";

type JobOpeningStatus = "Open" | "Paused" | "Closed" | "Cancelled";

type JobOpeningHeaderProps = {
  jobOpeningId: string;
  name: string;
  status: JobOpeningStatus;
  areaName: string;
  openingDate: Date;
};

const statusStyles: Record<
  JobOpeningStatus,
  {
    label: string;
    badgeClassName: string;
    dotClassName: string;
  }
> = {
  Open: {
    label: "Abierta",
    badgeClassName: "bg-success-bg text-success",
    dotClassName: "bg-success",
  },
  Paused: {
    label: "Pausada",
    badgeClassName: "bg-warning-bg text-warning",
    dotClassName: "bg-warning",
  },
  Closed: {
    label: "Cerrada",
    badgeClassName: "bg-muted text-muted-foreground",
    dotClassName: "bg-muted-foreground",
  },
  Cancelled: {
    label: "Cancelada",
    badgeClassName: "bg-danger-bg text-danger",
    dotClassName: "bg-danger",
  },
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
}: JobOpeningHeaderProps) {
  const statusStyle = statusStyles[status];

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

            <Badge
              variant="secondary"
              className={`rounded-full ${statusStyle.badgeClassName}`}
            >
              <span
                className={`size-1.5 rounded-full ${statusStyle.dotClassName}`}
              />

              {statusStyle.label}

              <ChevronDown className="size-3.5" />
            </Badge>
          </div>

          <p className="text-sm text-text-secondary">
            {areaName} · {getOpeningLabel(openingDate)}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-10 gap-2 rounded-full px-5"
        >
          <Pencil className="size-4" />
          Editar
        </Button>

        <AddApplicantDialog jobOpeningId={jobOpeningId} />
      </div>
    </header>
  );
}